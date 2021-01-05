from RPi import GPIO

class Base:
    def __init__(self, led, button):
        self.led = led
        self.button = button
        self.active = False
        GPIO.add_event_callback(button.pin, self.hit)

    def hit(self):
        self.led.deactivate()
        self.active = False
        print(f"deactivated led with button on pin {self.button.pin}")

    def activate(self):
        self.led.activate()
        self.active = True
        