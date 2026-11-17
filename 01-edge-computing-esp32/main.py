"""Viela Tech — firmware do ESP32 (MicroPython, simulado no Wokwi).

Lê umidade e temperatura (DHT22) e luminosidade (LDR), calcula o
Índice de Vulnerabilidade de Microclima (IVM) no próprio dispositivo,
sinaliza a faixa de risco no OLED e nos LEDs e publica no ThingSpeak.

Faixas (as mesmas do Python, da Matemática e da aplicação web):
    IVM < 40        -> NORMAL   (LED verde)
    40 <= IVM < 70  -> ATENCAO  (LED amarelo)
    IVM >= 70       -> PERIGO   (LED vermelho)
"""

import network
import urequests
import time
import dht
from machine import Pin, ADC, I2C
import ssd1306

# --- CONFIGURAÇÕES DO THINGSPEAK ---
# Canal público: https://thingspeak.mathworks.com/channels/3571901
# A Write API Key NÃO fica no repositório. No projeto do Wokwi, troque o
# texto abaixo pela chave do canal (ThingSpeak > API Keys > Write API Key).
THINGSPEAK_URL = "http://api.thingspeak.com/update"
WRITE_API_KEY = "SUA_WRITE_API_KEY"

# --- REGRAS DO IVM (centralizadas) ---
PESO_UMIDADE = 0.6
PESO_FALTA_DE_LUZ = 0.4
LIMIAR_ATENCAO = 40.0
LIMIAR_PERIGO = 70.0
INTERVALO_ENVIO_S = 15        # o ThingSpeak aceita no mínimo 15 s entre envios
TIMEOUT_WIFI_S = 20

# --- INICIALIZAÇÃO DE PERIFÉRICOS ---
sensor_dht = dht.DHT22(Pin(15))

ldr = ADC(Pin(34))
ldr.atten(ADC.ATTN_11DB)  # Escala de leitura até 3,3 V (0 a 4095)

led_verde = Pin(2, Pin.OUT)
led_amarelo = Pin(5, Pin.OUT)
led_vermelho = Pin(4, Pin.OUT)

# Configuração do I2C e Display OLED
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 64, i2c)


# --- CONEXÃO WI-FI ---
def conectar_wifi():
    """Conecta à rede do simulador; desiste após TIMEOUT_WIFI_S segundos."""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Conectando ao Wi-Fi Wokwi-GUEST...")
        wlan.connect('Wokwi-GUEST', '')
        inicio = time.time()
        while not wlan.isconnected():
            if time.time() - inicio > TIMEOUT_WIFI_S:
                print("Wi-Fi indisponível: o dispositivo segue medindo e sinalizando localmente.")
                return False
            time.sleep(0.5)
    print("Wi-Fi Conectado! IP:", wlan.ifconfig()[0])
    return True


# --- LEITURA E PROCESSAMENTO ---
def ler_sensores():
    """Retorna (umidade %, temperatura °C, insolação %)."""
    sensor_dht.measure()
    umidade = sensor_dht.humidity()
    temperatura = sensor_dht.temperature()

    # No módulo fotorresistor do Wokwi a tensão em AO SOBE quando há MENOS luz
    # (divisor de tensão com o LDR). Por isso a insolação é o complemento.
    leitura_ldr = ldr.read()
    insolacao = 100.0 - (leitura_ldr / 4095.0) * 100.0

    return umidade, temperatura, insolacao


def calcular_ivm(umidade, insolacao):
    """IVM = 0,6 * Umidade + 0,4 * (100 - Insolação), em %.

    Quanto menos sol chega à viela e mais úmido o ar, maior a vulnerabilidade.
    """
    falta_de_luz = 100.0 - insolacao
    ivm = (PESO_UMIDADE * umidade) + (PESO_FALTA_DE_LUZ * falta_de_luz)
    return round(ivm, 1)


def classificar_ivm(ivm):
    """Retorna a faixa de risco usada em todo o projeto."""
    if ivm >= LIMIAR_PERIGO:
        return "PERIGO"
    if ivm >= LIMIAR_ATENCAO:
        return "ATENCAO"
    return "NORMAL"


def atualizar_display_e_leds(umidade, temperatura, insolacao, ivm):
    """Mostra as leituras no OLED e acende somente o LED da faixa atual."""
    faixa = classificar_ivm(ivm)

    oled.fill(0)
    oled.text("VIELA TECH", 0, 0)
    oled.text(f"Umid: {umidade:.1f}%", 0, 14)
    oled.text(f"Temp: {temperatura:.1f}C", 0, 24)
    oled.text(f"Insol: {insolacao:.1f}%", 0, 34)
    oled.text(f"IVM: {ivm}%", 0, 44)
    oled.text(f"STATUS: {faixa}", 0, 56)
    oled.show()

    led_verde.value(1 if faixa == "NORMAL" else 0)
    led_amarelo.value(1 if faixa == "ATENCAO" else 0)
    led_vermelho.value(1 if faixa == "PERIGO" else 0)
    return faixa


def enviar_thingspeak(umidade, insolacao, ivm, temperatura):
    """Publica field1..field4 no ThingSpeak (umidade, insolação, IVM, temperatura)."""
    url = (f"{THINGSPEAK_URL}?api_key={WRITE_API_KEY}"
           f"&field1={umidade}&field2={insolacao:.1f}&field3={ivm}&field4={temperatura}")
    try:
        res = urequests.get(url)
        # O ThingSpeak responde 200 com o entry_id criado, ou "0" se recusou o envio.
        print(f"ThingSpeak Resposta: {res.status_code} | entry_id: {res.text}")
        res.close()
    except Exception as e:
        print("Erro ao enviar para ThingSpeak:", e)


# --- EXECUÇÃO PRINCIPAL ---
conectado = conectar_wifi()

while True:
    try:
        u, t, i = ler_sensores()
        ivm = calcular_ivm(u, i)
        faixa = atualizar_display_e_leds(u, t, i, ivm)

        print(f"Umidade: {u}% | Temp: {t} C | Insolação: {i:.1f}% | IVM: {ivm}% | {faixa}")
        if conectado:
            enviar_thingspeak(u, i, ivm, t)
        else:
            conectado = conectar_wifi()

    except Exception as e:
        print("Erro no ciclo de leitura:", e)

    time.sleep(INTERVALO_ENVIO_S)
