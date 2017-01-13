'''
Purpose:
	Parse 
		"Date"
		"Reservoir Elevation (Daily)"
		"Storage (Daily)"
	For Each Dam(reservoir) - Update Everyday
Parameter:
	dams: list of dams we are concerned, eg:  ['ORO', 'CLE'] or GetDamsABBR()
	date: the date we start to collect data, eg: "6-JAN-2017"
	span: time span for query, eg: "1day" or "10days" or "1month"

'''

__author__ = "Dongjie Fan (dj)"

from bs4 import BeautifulSoup
import urllib2
import pandas as pd

def RecordDict():
	return {'Dam_ABBR': None, 
	        'Date': None, 
	        'RES ELE': None, 
	        'STORAGE': None 
	        # 'RES CHG': None, 
	        # 'OUTFLOW': None, 
	        # 'INFLOW': None, 
	        # 'EVAP': None, 
	        # 'FNF': None, 
	        # 'RIV REL': None, 
	        # 'PPT INC': None, 
	        # 'SPILL': None, 
	        #'DIS PWR': None
	        }

# More than 95 dams in total
def GetDamID():
	html = "http://cdec.water.ca.gov/misc/resinfo.html"
	page = urllib2.urlopen(html)
	soup = BeautifulSoup(page, "lxml")
	dam_abbr = []
	for i in soup.table.find_all("td"):
		if i.find_all("b"):
			dam_abbr.append(str(i.a.contents[0]))
	return dam_abbr

# 95 dams in total
def GetDamsABBR():
	html = "http://cdec.water.ca.gov/misc/daily_res.html"
	page = urllib2.urlopen(html)
	soup = BeautifulSoup(page, "lxml")
	dam_abbr = []
	for i in soup.table.find_all("b"):
		if len(i.text) == 3:
			dam_abbr.append(str(i.text))
			#print str(i.text)
	return dam_abbr

def GetSoup(dam_abbr="ORO", date="6-JAN-2017", span="1day"):
	#html = "http://cdec.water.ca.gov/cgi-progs/queryDaily?ORO&d=6-JAN-2017+09:35&span=1day"
    html = "http://cdec.water.ca.gov/cgi-progs/queryDaily?"+ dam_abbr + "&d=" + date + "+09:35&span=" + span
    page = urllib2.urlopen(html)
    soup = BeautifulSoup(page, "lxml")
    return soup

def GetAttributName(soup):
	list_att = []
	for att in soup.find_all("tr")[0].find_all('td'):
		if att.find_all("font"):
			list_att.append(str(att.text.strip("&nbsp").strip(" ")))
	return list_att

def GetDataPerDam(soup, dam_abbr):
	try:
		list_dam_data = []
		list_dam_att = GetAttributName(soup)
		for day in range(len(soup.find_all("tr")[2:])):
			j = day + 2
			list_row = RecordDict()
			list_row['Dam_ABBR'] = dam_abbr
			n_att = 0
			for val in soup.find_all("tr")[j].find_all('td'):
				if not val.find_all("a"):
					att = list_dam_att[n_att]
					if att in list_row.keys():
						list_row[att] = str(val.contents[0].strip(" "))
					n_att = n_att + 1
			list_dam_data.append(list_row)
		return list_dam_data
	except IndexError:
		pass
	

def GetDataAllDams(dams=GetDamsABBR(), date="6-JAN-2017", span="1day"):
	list_data = []
	for dam in dams:
		print dam
		list_data.extend(GetDataPerDam(GetSoup(dam, date, span), dam))
	return list_data


res=GetDataAllDams(['ORO', 'CLE'], "11-JAN-2017", "1month")
#print res
#print len(res)
df = pd.DataFrame(res)
df.to_csv("Daily.csv")




