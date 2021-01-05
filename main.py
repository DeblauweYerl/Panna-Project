from RPi import GPIO
import time
import random
import threading

from models.Led import Led
from models.Button import Button
from models.Base import Base
GPIO.setmode(GPIO.BCM)

leds = [Led([26, 19]), Led([13, 6]), Led([5, 0]), Led([11, 9]), Led([21, 20]), Led([16, 12]), Led([1, 7]), Led([8, 25])]
buttons = [Button(10), Button(22), Button(27), Button(17), Button(24), Button(23), Button(18), Button(15)]
bases = []
for led in leds:
    bases += Base(led, buttons[leds.index(led)])
    
time_score = 0
playing = False

def timer():
    global time_score
    if playing:
        start = time.time()
        time_score = time.time() - start
        time.sleep(1)
        print(f"elapsed_time: {time_score}")
def multiplayer():
    for led in leds[0:4]:
        led.activate("red")
    for led in leds[4:8]:
        led.activate("blue")
    result=" "
    while(result==" "):
        if bases[0].active==False and bases[1]==False and bases[2]==False and bases[3]==False:
            result="blue"
    
        if bases[4]==False and bases[5]==False and bases[6]==False and bases[7]==False:
            result="red"
    
      

def game(gamemode):
    if gamemode=="Multiplayer":
        name_player1=str(input("Whats the name of player 1 \n"))
        name_player2=str(input("Whats the name of player 2 \n"))
        mp = threading.Thread(target=multiplayer)
        mp.start()
    if gamemode=="Singleplayer":
        name_player1=str(input("Whats the name of the player \n"))
        sp = threading.Thread(target=singleplayer)
        sp.start()

   



def singleplayer(total_bases):
    global playing
    playing = True
    timer_thread = threading.Thread(target=timer)
    timer_thread.start()

    bases_completed = 0
    while(bases_completed <= total_bases):
        current_base = bases[random.randint(0, 7)]
        current_base.activate()
        current_base.check_for_hit()
        bases_completed += 1
    playing = False

try:
    game(gamemode)

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()