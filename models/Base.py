from RPi import GPIO

class Base:
    def __init__(self, led, button):
        self.led = led
        self.button = button
        self.active = False
        GPIO.add_event_callback(button.pin, self.hit)

    def hit(self, pin):
        self.led.deactivate()
        self.active = False
        print(f"deactivated led on pin {self.led.pin} with button on pin {self.button.pin}")

    def check_for_hit(self):
        status_button = GPIO.input(self.button.pin)
        while status_button == 0:
            status_button = GPIO.input(self.button.pin)

    def activate(self):
        self.led.activate()
        self.active = True

    def deactivate(self):
        self.led.deactivate()
        self.active = False