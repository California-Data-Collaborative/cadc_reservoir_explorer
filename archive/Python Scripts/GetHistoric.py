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

def GetResStats(url):
	historic = pd.read_csv(urllib.request.urlopen(url), header=3)
	# Drop last line 'End of data'
	last = max(historic.index)
	historic = historic.drop(["'sensor'"], axis=1)
	historic = historic.drop([last])
	# Convert historic data from monthly to daily format
	daily = historic.melt(id_vars=["'station'", "'year'", "'month'"], var_name = "day", value_name = "VALUE")
	# Remove missing values
	daily = daily[daily['VALUE'] != 'm']
	daily['day'] = pd.to_numeric(daily['day'])
	daily['VALUE'] = pd.to_numeric(daily['VALUE'])
	daily['date'] = pd.to_datetime(daily["'year'"]*10000 + daily["'month'"]*100 + daily["day"], format='%Y%m%d')
	return daily

dam_list = GetDamsABBR()
today = str(datetime.date.today())

# Create initial DataFrame
daily = pd.DataFrame()

#Iterate through all dams
#dam_list = ['ORO', 'CLE']
for dam in dam_list:
	print(dam)
	# Get historic csv file from 1/1/1900 to today for storage volume
	url_vol = "http://cdec.water.ca.gov/cgi-progs/getDailyCSV?station_id=" + dam + "&dur_code=D&sensor_num=15&start_date=1900/01/01&end_date=" + today
	url_el = "http://cdec.water.ca.gov/cgi-progs/getDailyCSV?station_id=" + dam + "&dur_code=D&sensor_num=6&start_date=1900/01/01&end_date=" + today

	volume = True
	elevation = True
	try:
		daily_vol = GetResStats(url_vol)
		daily_vol.rename(columns={"VALUE":"STORAGE", "'station'":"Dam_ABBR"}, inplace=True)
	except:
		volume = False
	try:
		daily_el = GetResStats(url_el)
		daily_el.rename(columns={"VALUE":"RES ELE", "'station'":"Dam_ABBR"}, inplace=True)
	except:
		elevation = False

	if (volume and elevation):
		# Merge elevation and volume dataframes
		daily_temp = daily_vol.merge(daily_el, on=['date','Dam_ABBR'], how='outer', sort=True)
		# Append to master daily file
		daily = daily.append(daily_temp, ignore_index=True)
	elif volume:
		daily = daily.append(daily_vol, ignore_index=True)
	elif elevation:
		daily = daily.append(daily_el, ignore_index=True)
	else:
		pass
# Export csv in usable format for each reservoir
daily.to_csv("DailyData.csv",columns=['Dam_ABBR', 'date', 'RES ELE', 'STORAGE'])

	# Create daily historic averages - TO BE DONE AS QUERY
	#averages = daily.groupby(["'month'",'day'], as_index=False).mean().drop(["'sensor'", "'year'"], axis = 1)
	#averages['date'] = averages.apply(lambda row: "{:02d}-{:02d}".format(int(row["'month'"]), row['day']), axis = 1)

	# Export historical average as csv for each reservoir
	#averages["'station'"] = dam
	#averages.to_csv("averages_historic"+dam,columns=["'station'", 'date', 'storage'])
