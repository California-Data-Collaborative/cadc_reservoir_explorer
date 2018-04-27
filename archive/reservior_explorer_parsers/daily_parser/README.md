# daily_parser


"This parser scrapes daily reservior(dam) data information from the Dept. of Water Resources - Data Exchange Center website"

## Parsing Strategy

Parsing is done in 2 parts:

Part 1:

Static data about dam like dam_abbr, dam name, longitude, latitude, capacity are fetched from source "http://cdec.water.ca.gov/misc/daily_res.html" and "http://cdec.water.ca.gov/misc/resinfo.html"

Part 2: 

Daily data about dam which includes date, storage, elevation are collected from individual html pages of the dams

## Datasource Notes

Document [...] updated here[(git hub repo)] provides the details about the data-source 

## Contacts

Vishwajeet Shelar <vys217@nyu.edu>
Dongjie Fan <df1676@nyu.edu>