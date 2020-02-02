import os
import time
import uuid

from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains

SELENIUM_EXECUTOR = os.environ["SELENIUM_EXECUTOR"]
RECAPTCHA_OVERRIDE = os.environ["RECAPTCHA_OVERRIDE"]
EMAIL_ADDRESS = os.environ["EMAIL_ADDRESS"]
EMAIL_PASSWORD = os.environ["EMAIL_PASSWORD"]

PAUSE_DURATION = 0.1

desired_cap = {
    "browser": "Chrome",
    "browser_version": "80.0 beta",
    "os": "Windows",
    "os_version": "10",
    "resolution": "1024x768",
    "name": "BasicShare Travis Test",
    "browserstack.maskCommands": "setValues, setCookies"
}

def run_test(driver):
    name = str(uuid.uuid4())[:25]
    message = str(uuid.uuid4())

    driver.get("https://basicshare.io")
    time.sleep(1)
    driver.add_cookie({
        "name": "recaptchaOverride",
        "value": RECAPTCHA_OVERRIDE,
        "domain": "basicshare.io"
    })
    ActionChains(driver)\
        .send_keys(name)\
        .pause(PAUSE_DURATION)\
        .click(driver.find_element_by_id("next-button"))\
        .pause(PAUSE_DURATION)\
        .send_keys(EMAIL_ADDRESS)\
        .pause(PAUSE_DURATION)\
        .click(driver.find_element_by_id("next-button"))\
        .pause(PAUSE_DURATION)\
        .send_keys(message)\
        .pause(PAUSE_DURATION)\
        .click(driver.find_element_by_id("next-button"))\
        .pause(PAUSE_DURATION)\
        .click(driver.find_element_by_id("next-button"))\
        .perform()

    time.sleep(3)

    driver.find_element_by_css_selector(".card a").click()

    # Close the password tab and return to original tab
    driver.close()
    driver.switch_to.window(driver.window_handles[0])

    driver.get("https://accounts.zoho.com/signin?servicename=VirtualOffice&signupurl=https://www.zoho.com/mail/zohomail-pricing.html&serviceurl=https://mail.zoho.com")
    time.sleep(2)

    ActionChains(driver)\
        .send_keys(EMAIL_ADDRESS)\
        .pause(PAUSE_DURATION)\
        .click(driver.find_element_by_id("nextbtn"))\
        .pause(PAUSE_DURATION)\
        .send_keys(EMAIL_PASSWORD)\
        .pause(PAUSE_DURATION)\
        .click(driver.find_element_by_id("nextbtn"))\
        .perform()

    time.sleep(5)

    driver.execute_script("document.querySelector('.zmLContent').click()")

    time.sleep(1)

    driver.execute_script("document.querySelector('.jsConTent a').click()")

    time.sleep(3)

    # Once link is clicked, retarget Selenium to new tab
    driver.switch_to.window(driver.window_handles[1])

    assert driver.find_element_by_css_selector(".danger .card-body").text == message

try:
    driver = webdriver.Remote(command_executor=SELENIUM_EXECUTOR, desired_capabilities=desired_cap)
    run_test(driver)
finally:
    driver.quit()
