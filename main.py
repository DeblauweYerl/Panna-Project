from RPi import GPIO
import time

from models.Led import Led
GPIO.setmode(GPIO.BCM)

led0 = Led([26, 19])
led1 = Led([13, 6])
led2 = Led([5, 0])
led3 = Led([11, 9])
led4 = Led([10, 22])
led5 = Led([27, 17])
led6 = Led([4, 3])
led7 = Led([2, 14])

leds = [led0,led1,led2,led3,led4,led5,led6,led7]


try:
    while True:
        pass

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()