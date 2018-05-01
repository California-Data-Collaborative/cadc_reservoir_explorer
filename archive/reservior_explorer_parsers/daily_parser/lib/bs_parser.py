###
# Custom parser to scrape the dam data like date, storage and elevation from the html pages 
# downloaded in data.yaml 
###

from bs4 import BeautifulSoup
import pandas as pd
import parsekit
import re

class parser(parsekit.Step):

	def RecordDict(self):
		return {'Dam_ABBR': None, 
	    	    'Date': None, 
	    	    'STORAGE': None,
	        	'RES ELE': None 
	        	 }
	        # 'RES CHG': None, 
	        # 'OUTFLOW': None, 
	        # 'INFLOW': None, 
	        # 'EVAP': None, 
	        # 'FNF': None, 
	        # 'RIV REL': None, 
	        # 'PPT INC': None, 
	        # 'SPILL': None, 
	        #'DIS PWR': None

#   Read the html page using Beautiful Soup
	def GetSoup(self, data):
		soup = BeautifulSoup(data, "lxml")
		return soup

#   Get the list of attributes present for the dam in consideration eg. storage, elevation, etc
	def GetAttributName(self, soup):
		list_att = []
		if len(soup.find_all("table")) > 1:
			for att in soup.find_all("table")[1].find_all("tr")[0].find_all('td'):			
				if att.find_all("font"):
					list_att.append(str(att.text.strip("&nbsp").strip(" ")))
			return list_att
		else:

			for att in soup.find_all("tr")[0].find_all('td'):
				if att.find_all("font"):
					list_att.append(str(att.text.strip("&nbsp").strip(" ")))
			return list_att

#   Get the dam data as per the available attributes and the structure of dictonary initialised in "RecordDict()" 
	def GetDataPerDam(self, soup, metadata):

#       Get the Dam_Abbr
		url = metadata['name']
		c = re.findall('^http://cdec.water.ca.gov/cgi-progs/queryDaily\?([A-Z][A-Z][A-Z]).*', url)
		dam_abbr = c[0]

		try:
			list_dam_data = []
			list_dam_att = self.GetAttributName(soup)

#       	Get the data as per the attribute(More than 1 table present in the html page)
			if len(soup.find_all("table")) > 1:

				for day in range(len(soup.find_all("table")[1].find_all("tr")[2:])):
					j = day + 2
					list_row = self.RecordDict()
					# self.log.info(list_row.keys())
					list_row['Dam_ABBR'] = dam_abbr
					n_att = 0
					for val in soup.find_all("table")[1].find_all("tr")[j].find_all('td'):
						if not val.find_all("a"):
							# self.log.info(val)
							att = list_dam_att[n_att]
							if att in list_row.keys():
								list_row[att] = str(val.contents[0].strip(" "))
							n_att = n_att + 1				
					list_dam_data.append(list_row)	
				return list_dam_data

#       	Get the data as per the attribute(1 table present in the html page)			
			else:

				for day in range(len(soup.find_all("tr")[2:])):
					j = day + 2
					list_row = self.RecordDict()
					# self.log.info(list_row.keys())
					list_row['Dam_ABBR'] = dam_abbr
					n_att = 0
					for val in soup.find_all("tr")[j].find_all('td'):
						# self.log.info(val.find_all("a"))
						if not val.find_all("a"):
							att = list_dam_att[n_att]
							if att in list_row.keys():
								# self.log.info(val)
								list_row[att] = str(val.contents[0].strip(" "))
							n_att = n_att + 1
					list_dam_data.append(list_row)	
				return list_dam_data
			
		except IndexError:
			pass

	def run(self, record, metadata):

		data = open(record, "r").read()
		res = self.GetDataPerDam(self.GetSoup(data), metadata)

		if res != None:

			for num in xrange(len(res)):
				row = res[num]
				list_data = [row['Dam_ABBR'], row['Date'], row['STORAGE'], row['RES ELE']]
		 		yield list_data, metadata

