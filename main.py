from RPi import GPIO
import time

from models.Led import Led
GPIO.setmode(GPIO.BCM)

leds = [Led([26, 19]), Led([13, 6]), Led([5, 0]), Led([11, 9]), Led([21, 20]), Led([16, 12]), Led([1, 7]), Led([8, 25])]
buttons = [Button(10), Button(22), Button(27), Button(17), Button(24), Button(23), Button(18), Button(15)]
bases = []
for led in leds:
    bases += Base(led, buttons[leds.index(led)])


try:
    while True:
        pass

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()