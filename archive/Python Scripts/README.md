Python scripts written using Beautiful Soup to parse below reservior data:

* Station ID
* Station Name
* Date
* Elevation
* Capacity
* Storage
* Percentage

***
GetCapacity.py
> To parse Static Data(including Capacity/Station Name) for each selected dam (reservoir)

GetDataListDict.py
> To parse Daily Updated Data (including Date/Elevation/Storage for selected dam (reservoir)
> Updated to pull one day of data to be added to historical database

GetHistoric.py
> To download and parse all historic daily Elevation and Storage data for all reservoirs

Merge.py
> To merge Static and Daily Updated Data in .csv file and calculate the percent of storage

data.csv
> output demo

DailyData.csv
> output of GetHistoric.py
