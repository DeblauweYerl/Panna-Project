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


def timer():
    start = time.time()
    elapsed_time = time.time() - start

def singleplayer(total_bases):
    timer_thread = threading.Thread(target=timer)
    timer_thread.start()

    bases_completed = 0
    while(bases_completed <= total_bases):
        current_base = bases[random.randint(0, 7)]
        current_base.activate()
        current_base.check_for_hit()
        bases_completed += 1

try:
    while True:
        pass

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()