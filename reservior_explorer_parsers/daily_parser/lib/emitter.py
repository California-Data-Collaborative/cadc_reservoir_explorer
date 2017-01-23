###
# Custom url emitter using the date and span and Dam Abbreviations 
# received from the sqlite database creted in latlon codec
###

import datetime
import parsekit
import re
import sqlite3

class emit_paths(parsekit.Step):
    def run(self, record, metadata):
        
        conn = sqlite3.connect('dam.db')
        cur = conn.cursor()
        data = cur.execute("SELECT Dam_ABBR FROM capacity_and_latlong")         

        for row in data:
            
            dam_id = row[0]
            date = datetime.datetime.now() - datetime.timedelta(days=1)
            span = "1day"             
            path = 'http://cdec.water.ca.gov/cgi-progs/queryDaily?%s&d=%s&span=%s' % (dam_id, date, span)

            yield path, metadata
        cur.close()
        
        
        

####################################################
# Test on some  # date = datetime.datetime.now()
        # span = "1day" 
        # dams = [ 'PAR', 'PNF']
        # # dams = [ 'BLB', 'BRD', 'BUC', 'BUL', 'CAS', 'CHV', 'CLE', 'CMN', 'DAV', 'DNN', 'ENG', 'FOL', 'HID', 'HTH', 'INV', 'ISB', 
        # #         'ANT', 'KES', 'LEW', 'LON', 'MIL', 'NHG', 'NML', 'ORO', 'PAR', 'PNF', 'PYM', 'SCC', 'SHA', 'SNL', 'STP', 'TRM', 'TUL', 'UNV', 'WHI', 'WRS']


        # for dam in dams:

        #     # date = "2017011718:53"
        #     path = 'http://cdec.water.ca.gov/cgi-progs/queryDaily?%s&d=%s&span=%s' % (dam, date, span)   
        #     yield path, metadata  