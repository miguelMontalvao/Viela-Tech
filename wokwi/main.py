import network
import urequests
import time
import dht
from machine import Pin, ADC, I2C
import ssd1306

# --- CONFIGURAÇÕES DO THINGSPEAK ---
THINGSPEAK_URL = "http://api.thingspeak.com/update"
WRITE_API_KEY = "Q2W871WS4GGRX15J"  

# --- INICIALIZAÇÃO DE PERIFÉRICOS ---
sensor_dht = dht.DHT22(Pin(15))

ldr = ADC(Pin(34))
ldr.atten(ADC.ATTN_11DB)  # Escala de leitura até 3.3V (0 a 4095)

led_verde = Pin(2, Pin.OUT)
led_vermelho = Pin(4, Pin.OUT)

# Configuração do I2C e Display OLED
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 64, i2c)

# --- CONEXÃO WI-FI ---
def conectar_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Conectando ao Wi-Fi Wokwi-GUEST...")
        wlan.connect('Wokwi-GUEST', '')
        while not wlan.isconnected():
            time.sleep(0.5)
    print("Wi-Fi Conectado! IP:", wlan.ifconfig()[0])

# --- LEITURA E PROCESSAMENTO ---
def ler_sensores():
    # DHT22 (Umidade)
    sensor_dht.measure()
    umidade = sensor_dht.humidity()
    temp = sensor_dht.temperature()
    
    # LDR (Luminosidade normalizada de 0% a 100%)
    leitura_ldr = ldr.read()
    insolacao = (leitura_ldr / 4095.0) * 100.0
    
    return umidade, temp, insolacao

def calcular_ivm(umidade, insolacao):
    # Fórmula do IVM: IVM = 0.6 * Umidade + 0.4 * (100 - Insolação)
    # Quanto menor a insolação no beco, maior a vulnerabilidade
    nivel_u = umidade
    nivel_i = 100.0 - insolacao
    ivm = (0.6 * nivel_u) + (0.4 * nivel_i)
    return round(ivm, 1)

def atualizar_display_e_leds(umidade, insolacao, ivm):
    oled.fill(0)
    oled.text("CANYON - ROCINHA", 0, 0)
    oled.text(f"Umid: {umidade:.1f}%", 0, 16)
    oled.text(f"Insol: {insolacao:.1f}%", 0, 28)
    oled.text(f"IVM: {ivm}%", 0, 42)
    
    if ivm >= 70.0:
        oled.text("STATUS: PERIGO", 0, 54)
        led_vermelho.value(1)
        led_verde.value(0)
    else:
        oled.text("STATUS: NORMAL", 0, 54)
        led_vermelho.value(0)
        led_verde.value(1)
        
    oled.show()

def enviar_thingspeak(umidade, insolacao, ivm):
    url = f"{THINGSPEAK_URL}?api_key={WRITE_API_KEY}&field1={umidade}&field2={insolacao}&field3={ivm}"
    try:
        res = urequests.get(url)
        print(f"ThingSpeak Resposta: {res.status_code}")
        res.close()
    except Exception as e:
        print("Erro ao enviar para ThingSpeak:", e)

# --- EXECUÇÃO PRINCIPAL ---
conectar_wifi()

while True:
    try:
        u, t, i = ler_sensores()
        ivm = calcular_ivm(u, i)
        
        print(f"Umidade: {u}% | Insolação: {i:.1f}% | IVM: {ivm}%")
        atualizar_display_e_leds(u, i, ivm)
        enviar_thingspeak(u, i, ivm)
        
    except Exception as e:
        print("Erro no ciclo de leitura:", e)
        
    # O ThingSpeak exige intervalo mínimo de 15 segundos entre publicações
    time.sleep(15)