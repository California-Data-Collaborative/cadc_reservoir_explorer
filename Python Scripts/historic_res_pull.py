#http://cdec.water.ca.gov/cgi-progs/getDailyCSV?station_id=CLE&dur_code=D&sensor_num=15&start_date=1900/01/01&end_date=2018/02/15

from bs4 import BeautifulSoup
import urllib.request
import datetime
import pandas as pd

def GetDamsABBR():
	html = "http://cdec.water.ca.gov/misc/daily_res.html"
	page = urllib.request.urlopen(html)
	soup = BeautifulSoup(page, "lxml")
	dam_abbr = []
	for i in soup.table.find_all("b"):
		if len(i.text) == 3:
			dam_abbr.append(str(i.text))
			#print str(i.text)
	return dam_abbr

dam_list = GetDamsABBR()
today = str(datetime.date.today())

for dam in dam_list:
	# Get historic csv file from 1/1/1900 to today
	html = "http://cdec.water.ca.gov/cgi-progs/getDailyCSV?station_id=" + dam + "&dur_code=D&sensor_num=15&start_date=1900/01/01&end_date=" + today
    historic = pd.read_csv(urllib.request.urlopen(html), header = 3)
	# Drop last line 'End of data'
	last = max(historic.index)
	historic = historic.drop([last])
	# Convert historic data from monthly to daily format
	daily = historic.melt(id_vars=["'station'", "'sensor'", "'year'", "'month'"], var_name = "day", value_name = "storage")
	# Remove missing values
	daily = daily[daily['storage'] != 'm']
	daily['day'] = pd.to_numeric(daily['day'])
	daily['storage'] = pd.to_numeric(daily['storage'])
	daily['date'] = pd.to_datetime(daily["'year'"]*10000+daily["'month'"]*100+daily["day"],format='%Y%m%d')
	# Export csv in usable format for each reservoir
	daily.to_csv("daily_historic"+dam,columns=["'station'", 'date', 'storage'])

	# Create daily historic averages
	averages = daily.groupby(["'month'",'day'], as_index=False).mean().drop(["'sensor'", "'year'"], axis = 1)
	averages['date'] = averages.apply(lambda row: "{:02d}-{:02d}".format(int(row["'month'"]), row['day']), axis = 1)

	# Export historical average as csv for each reservoir
	averages["'station'"] = dam
	averages.to_csv("averages_historic"+dam,columns=["'station'", 'date', 'storage'])
