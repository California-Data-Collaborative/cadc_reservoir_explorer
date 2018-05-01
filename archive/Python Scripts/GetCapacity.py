'''
Purpose:
	Parse 
		"Capacity" 
	For Each Dam(reservoir) - Static Data
'''

__author__ = "Dongjie Fan (dj)"

from bs4 import BeautifulSoup
import urllib2
import pandas as pd

def DamStaticData():
	return {"Dam_ABBR": None,
	        #"Dam ID": None,
	        "Dam Name": None,
	        #"Latitude": None,
	        #"Longitude": None,
	        #"County": None,
	        #"Storage Capacity": None,
	        "Capacity": None}

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

def GetSoupForDam(dam_abbr = "INV"):
	html = "http://cdec.water.ca.gov/cgi-progs/profile?s=" + dam_abbr #+ "&type=dam"
	page = urllib2.urlopen(html)
	soup = BeautifulSoup(page, "lxml") 
	return soup

def GetStaticPerDam(dam_abbr = "INV"):
	soup = GetSoupForDam(dam_abbr)
	staticData = DamStaticData()
	staticData['Dam_ABBR'] = dam_abbr
	try:
		for i in soup.table.find_all("tr"):
			for j in i.find_all("td"):
				if j.text in staticData.keys():
					att = j.text
					#print j.find_next('td').text
					staticData[att] = str(j.find_next('td').text)
	except AttributeError:
		pass
	# if not staticData['Storage Capacity']==None:
	# 	staticData['Storage Capacity'] = staticData['Storage Capacity'].replace(" ac-ft", "")
	# 	staticData['Storage Capacity'] = staticData['Storage Capacity'].replace(",", "")
	if not staticData['Capacity']==None:
		staticData['Capacity'] = staticData['Capacity'].replace(" af", "")
		staticData['Capacity'] = staticData['Capacity'].replace(",", "")
	return staticData

def  GetStaticAllDam(dam_list):
	all_staticData = []
	for dam in dam_list:
		print dam
		all_staticData.append(GetStaticPerDam(dam))
	return all_staticData



res=GetStaticAllDam(['ORO', 'CLE'])
# print len(res)
# print res
df = pd.DataFrame(res)
df.to_csv("Static.csv")
