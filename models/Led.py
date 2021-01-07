from RPi import GPIO

class Led:
    def __init__(self, pins):
        for pin in pins:
            GPIO.setup(pin, GPIO.OUT)
        self.pins = pins

    def activate(self, color='red'):
        if color == "red":
            GPIO.output(self.pins[0], 1)
        if color == "blue":
            GPIO.output(self.pins[1], 1)

    def deactivate(self):
        GPIO.output(self.pins, 0)