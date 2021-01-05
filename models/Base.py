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
        print(f"deactivated led with button on pin {self.button.pin}")

    def check_for_hit(self):
        status_button = GPIO.input(self.button.pin)
        while status_button == 1:
            status_button = GPIO.input(self.button.pin)

    def activate(self, color='red'):
        self.led.activate(color)
        self.active = True

    def deactivate(self):
        self.led.deactivate()
        self.active = False