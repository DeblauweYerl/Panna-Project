from RPi import GPIO
import time

from models.Led import Led
GPIO.setmode(GPIO.BCM)

leds = [Led([26, 19]), Led([13, 6]), Led([5, 0]), Led([11, 9]), Led([21, 20]), Led([16, 12]), Led([1, 7]), Led([8, 25])]
buttons = [Button(10), Button(22), Button(27), Button(17), Button(24), Button(23), Button(18), Button(15)]
bases = []
for led in leds:
    bases += Base(led, buttons[leds.index(led)])
def start_multiplayer():
     for led in leds[0:4]:
         led.activate("red")
     for led in leds[4:8]:
         led.activate("blue")
     if leds[0].active==False and leds[1].active==False and leds[2].active==False and leds[3].active==False:
        result="Team blue wins"

     if leds[4].active==False and leds[5].active==False and leds[6].active==False and leds[7].active==False:
        result="Team red wins" 

def multiplayer():
    name_player1=str(input("Whats the name of player 1 \n"))
    name_player2=str(input("Whats the name of player 2 \n"))
    if name_player1 =="" or name_player2=="":
        print("1 of meerdere namen niet ingegeven")
        multiplayer()
    start_multiplayer()


try:
    while True:
        multiplayer()

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()