from RPi import GPIO

class Led:
    def __init__(self, pin):
        GPIO.setup(pin, GPIO.OUT)
        self.pin = pin

    def activate(self):
        GPIO.output(self.pin, 1)

    def deactivate(self):
        GPIO.output(self.pin, 0)