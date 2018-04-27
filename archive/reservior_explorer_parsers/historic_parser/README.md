# historic_parser

"This parser scrapes historic reservoir(dam) data information from the Dept. of Water Resources - Data Exchange Center website"

## Parsing Strategy

Parsing is done in 2 parts:

Part 1:

Static data about dam like dam_abbr, dam name, longitude, latitude, capacity are fetched from source "http://cdec.water.ca.gov/misc/daily_res.html" and "http://cdec.water.ca.gov/misc/resinfo.html"

Part 2: 

Historic data about dam which includes date, storage, elevation are collected from individual html pages of the dams

## Datasource Notes

Document Technical Specification uploaded here "https://github.com/California-Data-Collaborative/cadc_reservoir_explorer/tree/master/reservior_explorer_parsers"  provides the details about the data-source 

## Contacts

Vishwajeet Shelar <vys217@nyu.edu>
Dongjie Fan <df1676@nyu.edu>