from RPi import GPIO

class Button:
    def __init__(self, pin):
        self.pin = pin
        GPIO.setup(pin, GPIO.IN, GPIO.PUD_UP)
        GPIO.add_event_detect(pin, GPIO.FALLING, bouncetime=2000)