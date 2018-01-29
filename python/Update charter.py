from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.ui import Select
import pdfkit
import time
import datetime
from datetime import timedelta
path_wkthmltopdf = r'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=path_wkthmltopdf)
#### number of days in advance to schedule
daysToSchedual = 28

def getMonth(dateTime):
    month = eval(dateTime[:dateTime.find('/')])
    return str(month)

def getDay(dateTime):
    day = eval(dateTime[dateTime.find('/')+1:dateTime.rfind('/')])
    return str(day)

def getYear(dateTime):
    year = eval(dateTime[dateTime.rfind('/')+1:dateTime.rfind('/')+5])
    print(year)
    print(dateTime.find(' '))
    return str(year)

def getT(dateTime, startbool):
    print(dateTime)
    hours = eval(dateTime[dateTime.find(' ')+1:dateTime.find(':')])
    mins = float(dateTime[dateTime.find(':')+1:dateTime.rfind(' ')])
    if 'P' in dateTime :
        if hours != 12 :
            hours += 12
    elif hours == 12 :
        hours = 0
    mins = round(mins/30.0)
    hours = hours * 60 + mins * 30
    if hours > 1410 :
        hours = 1410
    return str(hours)

def openTripTracker():
    #Login Trip Tracker
    driver = webdriver.Chrome()
    actionChains = ActionChains(driver)
    driver.get("https://vtrans-web.hopkinsschools.org/Triptracker/Login.aspx?ReturnUrl=%2fTriptracker%2fTripRequest.aspx%3fRecordID%3d3251&RecordID=3251")
    element = driver.find_element_by_name("TxtBxUName")
    element.send_keys("[user name]") #add user name
    element = driver.find_element_by_name("TxtBxPWord")
    element.send_keys("[password]") #add password
    driver.find_element_by_id("BtnLogin").click()
    return driver

def iterateCharters(driver, webmail):
    getCharterinfo(driver, webmail)


def makePdf(driver, charter):
    print(charter)
    #find out what this window is called so you can get back to it
    main_window_handle = None
    while not main_window_handle:
        main_window_handle = driver.current_window_handle

    #open new popup that has info
    driver.find_element_by_id("ctl00_contentPage_ucTripRequestView_PrintPage").click()

    #find new window
    signin_window_handle = None
    while not signin_window_handle:
        for handle in driver.window_handles:
            if handle != main_window_handle:
                signin_window_handle = handle
                break
    driver.switch_to.window(signin_window_handle) #switch to new window

    #start generating html code for pdf
    pdfhtml = '<h1> '
    startTime = charter[2]
    startDate = datetime.date(eval(getYear(startTime)), eval(getMonth(startTime)), eval(getDay(startTime)))
    startDay = startDate.weekday()
    if startDay == 0 :
        pdfhtml += "Monday "
    elif startDay == 1:
        pdfhtml += "Tuesday "
    elif startDay == 2:
        pdfhtml += "Wednesday "
    elif startDay == 3:
        pdfhtml += "Thursday "
    elif startDay == 4:
        pdfhtml += "Friday "
    elif startDay == 5:
        pdfhtml += "Saturday "
    else:
        pdfhtml += "Sunday "

    if charter[5] :
        pdfhtml += "Trailer "

    if charter[6] > 0:
        pdfhtml += "WC x " + str(charter[6])
        
    pdfhtml += '</h1>'
    pdfhtml += 'updated ' + str(datetime.datetime.now())
    pdfhtml += driver.find_element_by_xpath('/html/body').get_attribute("innerHTML")
    pdfhtml += '<table border=1 style="border-collapse: collapse">  <tr bgcolor = "#CCCCCC">    <th width=180 bgcolor = "#FFFFFF"  style="font-size: 50%; text-align:left">NAME</th>    <th width=100>Time</th>    <th width=120>Mileage</th>  </tr>'
    pdfhtml += '<tr>    <td>SIGN ON</td>    <td> </td>    <th>XXXXXXX</th>  </tr>  <tr>    <td>LEAVE BASE</td>    <td> </td>    <td> </td>  </tr>  <tr>    <td>ARRIVE PICKUP</td>    <td> </td>    <th> </th>'
    pdfhtml += '</tr>  <tr>    <td>DEPART PICKUP</td>    <td> </td>    <th>XXXXXXX</th>  </tr>  <tr>    <td>ARRIVE DROP OFF</td>    <td> </td>    <th> </th>  </tr>  <tr>    <td>DEPART DROP OFF</td>    <td> </td>    <th> </th>  </tr>'
    pdfhtml += '<tr>    <td>ARRIVE ORIGIN</td>    <td> </td>    <th> </th>  </tr>  <tr>    <td>DEPART ORIGIN</td>    <td> </td>    <th>XXXXXXX</th>  </tr>  <tr>    <td>ARRIVE BASE</td>    <td> </td>    <th> </th>  </tr>'
    pdfhtml += '  <tr>    <td>SIGN OUT</td>    <td> </td>    <th>XXXXXXX</th>  </tr>  <tr style="border:0">  	<td height = 5 style="border:0"></td>  </tr>  <tr>    <td>TOTAL</td>    <td> </td>    <th> </th>  </tr></table>'

    driver.close()
    driver.switch_to.window(main_window_handle)

    driver.find_element_by_xpath('//*[@id="ctl00_contentPage_btnTripDirections"]').click()
    driver.implicitly_wait(10)
    time.sleep(5)
    driver.find_element_by_link_text("Open Trip Directions/Mapping Tool").click()
    driver.implicitly_wait(10)
    time.sleep(4)
    driver.implicitly_wait(10)
    driver.find_element_by_xpath('//*[@id="CalcDirectionsButton"]').click()
    driver.implicitly_wait(10)
    time.sleep(2)
    element = driver.find_element_by_xpath('//*[@id="SetDirectionButton"]').click()
    driver.implicitly_wait(10)
    time.sleep(2)
    
    try:
        WebDriverWait(driver, 3).until(EC.alert_is_present(),
                                       'Timed out waiting for PA creation ' +
                                       'confirmation popup to appear.')

        alert = driver.switch_to_alert()
        alert.accept()
        print("alert accepted")
    except TimeoutException:
        print("no alert")

    driver.find_element_by_xpath('//*[@id="ctl00_contentPage_TripMapToolBing_HeaderPanel"]/table/tbody/tr/td[2]/a[2]').click()

    driver.find_element_by_link_text("Scheduling").click()
    driver.implicitly_wait(10)
    time.sleep(8)
    driver.find_element_by_id("ctl00_contentPage_ucTripScheduleNew_grdMasterGrid_cell0_6_ddlVehicleDriverList_B-1").click()
    driver.implicitly_wait(10)
    time.sleep(10)
    driver.find_element_by_id("ctl00_contentPage_ucTripScheduleNew_grdMasterGrid_cell0_6_ddlVehicleDriverList_DDD_L_LBI1T0").click()
    driver.implicitly_wait(10)
    time.sleep(6)
    driver.find_element_by_id("ctl00_contentPage_ucTripScheduleNew_grdMasterGrid_cell0_7_ddlVehicleList_B-1").click()
    driver.implicitly_wait(10)
    time.sleep(10)
    driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripScheduleNew_grdMasterGrid_cell0_7_ddlVehicleList_DDD_L_LBT"]/tbody/tr[3]').click()
    driver.implicitly_wait(10)
    time.sleep(6)
    driver.find_element_by_id("ctl00_contentPage_ucTripScheduleNew_btnSaveSchedule").click()
    driver.implicitly_wait(10)
    time.sleep(6)
    driver.find_element_by_id("ctl00_contentPage_ucTripScheduleNew_btnDTSReportWithMap").click()
    driver.implicitly_wait(10)
    time.sleep(10)
    signin_window_handle = None
    while not signin_window_handle:
        for handle in driver.window_handles:
            if handle != main_window_handle:
                signin_window_handle = handle
                break
    driver.switch_to.window(signin_window_handle)
    driver.implicitly_wait(10)
    time.sleep(2)
    driver.find_element_by_id("ctl00_contentPage_PreviewButton").click()
    driver.implicitly_wait(10)
    time.sleep(2)

    driver.switch_to.frame(driver.find_element_by_xpath('//*[@id="ctl00_contentPage_TylerReportViewer_ContentFrame"]'))
    pdfhtml += '<P style="page-break-before: always">'
    pdfhtml += driver.find_element_by_xpath('/html/body').get_attribute("innerHTML")
    driver.switch_to.default_content()
    
    print(driver.find_element_by_id("ctl00_contentPage_ReportToolbar1_Menu_ITCNT7_PageCount_I").get_attribute('value'))
    page_count = eval(driver.find_element_by_id("ctl00_contentPage_ReportToolbar1_Menu_ITCNT7_PageCount_I").get_attribute('value'))
    for i in range(page_count - 1):
        print(i)
        driver.find_element_by_id("ctl00_contentPage_ReportToolbar1_Menu_DXI8_T").click()
        driver.implicitly_wait(10)
        time.sleep(2)
        driver.switch_to.frame(driver.find_element_by_xpath('//*[@id="ctl00_contentPage_TylerReportViewer_ContentFrame"]'))
        pdfhtml += '<P style="page-break-before: always">'
        pdfhtml += driver.find_element_by_xpath('/html/body').get_attribute("innerHTML")
        driver.switch_to.default_content()

    print("####html>>out2.pdf")

    index = pdfhtml.find('<img')
    sourceattribute = 'src="'
    index += pdfhtml[index:].find(sourceattribute)
    pdfhtml = pdfhtml[:index + len(sourceattribute)] + "https://vtrans-web.hopkinsschools.org" + pdfhtml[index + len(sourceattribute) :]
    #print(pdfhtml)
    fileName = charter[0] + ".pdf"
    pdfkit.from_string(pdfhtml, fileName, configuration=config)

    driver.close()
    driver.switch_to.window(main_window_handle)

def getCharterinfo(driver, webmail):
    print("Please delete the charter from the calandar before continuing")
    charterIdPrompt = input("Enter charter ID: ")
    charterWebPage = "https://vtrans-web.hopkinsschools.org/Triptracker/TripRequest.aspx?RecordID=" + charterIdPrompt
    driver.get(charterWebPage)
    driver.implicitly_wait(10)
    charterId = driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_lblTripID"]').text
    charterName = driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_lblTripName"]').text
    startTime = driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_lblOriginDeparture"]').text
    try:
        endTime = driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_lblOriginReturn"]').text
    except NoSuchElementException:
        endTime = driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_gvDestinations"]/tbody/tr[2]/td[2]').text   
        print("EXCEPTION HANDLED >>>> one way end time", endTime)
    numBuses = eval(driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_lblNoVehicles"]').text)
    trailerBool = "trailer" in str(driver.find_element_by_xpath('//*[@id="contentstart"]').get_attribute("innerHTML")).lower()
    wc = eval(driver.find_element_by_xpath('//*[@id="ctl00_contentPage_ucTripRequestView_lblNoWheelchairs"]').text)
    print(charterId, ":", charterName, "@", startTime, "-", endTime, "#", numBuses, "^T", trailerBool, "%WC", wc)

    startDate = datetime.date(eval(getYear(startTime)), eval(getMonth(startTime)), eval(getDay(startTime)))
    startDay = startDate.weekday()
    today = datetime.date.today()
    weekout = today + timedelta(days=daysToSchedual)

    lessThanWeekAway = startDate < weekout

    if True :
        charter = [charterId, charterName, startTime, endTime, numBuses, trailerBool, wc, numBuses, startDay]
        makePdf(driver, charter)
        #webmail = openWebMail()
        while charter[4] > 0 :
            addCharterToCalandar(webmail, charter)
            charter[4] -= 1
        #strng = input("enter random value to continue")
        #webmail.close()
    else :
        print("I can't see the future")
    
    return lessThanWeekAway

def openWebMail():
    #https://webmail.mtibus.com/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fwebmail.mtibus.com%2fowa%2f
    edriver = webdriver.Chrome()
    edriver.get("https://webmail.mtibus.com/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fwebmail.mtibus.com%2fowa%2f")
    edriver.find_element_by_id("chkBsc").click()
    #assert "Python" in driver.title
    element = edriver.find_element_by_name("username")
    element.send_keys("[user name]") #add user name
    element = edriver.find_element_by_name("password")
    element.send_keys("[password]") #add password
    element.send_keys(Keys.RETURN)
    return edriver

def addCharterToCalandar(edriver, charter):
    edriver.find_element_by_id("lnkNavCal").click()
    edriver.get("https://webmail.mtibus.com/owa/?ae=Folder&t=IPF.Appointment&id=LgAAAABy45u0jvv4T5%2fbXH9lEKAGAQBjaF2crhh5T4vQqjyTvs%2b7ACtQ8AANAAAC")
    edriver.find_element_by_id("lnkHdrnewappt").click()
    charterId = charter[0]
    charterName = charter[1]
    startTime = charter[2]
    endTime = charter[3]
    numBuses = charter[4]
    trailerBool = charter[5]
    wc = charter[6]
    multiBus = charter[7]
    subject = charterId + " - " + charterName 
    if multiBus:
        subject += " - BUS " + str(numBuses)
    if trailerBool :
        subject += " **TRAILER**"
    if wc >= 1 :
        subject += " **WC " + str(wc) + "**"
    subject += " Updated"

    edriver.implicitly_wait(10)
    edriver.find_element_by_id("txtsbj").send_keys(subject)

    #attach charter PDF
    edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[18]/td[2]/a').click()
    edriver.implicitly_wait(10)
    elem = edriver.find_element_by_xpath('//*[@id="attach"]');
    edriver.implicitly_wait(10)
    filePath = "C:\\Program Files (x86)\\Python36-32\\" + charterId + ".pdf"
    elem.send_keys(filePath);
    edriver.implicitly_wait(10)
    edriver.find_element_by_xpath('//*[@id="attachbtn"]').click()
    edriver.find_element_by_xpath('//*[@id="lnkHdrdone"]').click()

    #enter charter date and time info.
    startValue = getT(startTime, True)
    endValue = getT(endTime, True)
    if (eval(startValue) - eval(endValue)) >= 0:
        if (eval(startValue) - eval(endValue)) < 30:
            if endValue == "1410":
                startValue = "1380"
            else :
                endValue = str(eval(endValue) + 30)
        
    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[8]/td[5]/table/tbody/tr/td[1]/select'))
    select.select_by_value(getMonth(startTime))

    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[8]/td[5]/table/tbody/tr/td[2]/select'))
    select.select_by_value(getDay(startTime))

    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[8]/td[5]/table/tbody/tr/td[3]/select'))
    select.select_by_value(getYear(startTime))

    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[8]/td[5]/table/tbody/tr/td[4]/select'))
    select.select_by_value(startValue)

    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[10]/td[5]/table/tbody/tr/td[1]/select'))
    select.select_by_value(getMonth(endTime))

    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[10]/td[5]/table/tbody/tr/td[2]/select'))
    select.select_by_value(getDay(endTime))

    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[10]/td[5]/table/tbody/tr/td[3]/select'))
    select.select_by_value(getYear(endTime))

    
    select = Select(edriver.find_element_by_xpath('//*[@id="frm"]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr[10]/td[5]/table/tbody/tr/td[4]/select'))
    select.select_by_value(endValue)

    edriver.implicitly_wait(10)
    edriver.find_element_by_xpath('//*[@id="lnkHdrsaveclose"]').click()

def main():
    driver = openTripTracker()
    webmail = openWebMail()
    doAgain = True
    while 'y' in input("Do you want to update a charter?").lower() :
        iterateCharters(driver, webmail)
        
    webmail.close()
    driver.close()

main()
