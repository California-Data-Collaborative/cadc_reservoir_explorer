ParseKit Scripts to parse below reservior data (temporarily):

* Station ID (Dam_abbr)
* Station Name
* Capacity
* Latitude
* Longitude

***
latlon
> Function: To parse Latitude and Longitude for each dam (reservoir) <br/>
> Souce: http://cdec.water.ca.gov/misc/daily_res.html <br/>
> To-Do: Delete NA rows <br/>

capacity2
> Function: To parse Capacity and Station Name for each dam (reservoir)<br/>
> Souce: http://cdec.water.ca.gov/misc/resinfo.html<br/>

capacity (alternative)
> Function: To parse Capacity and Station Name for each dam (reservoir)<br/>
> Souce: http://cdec.water.ca.gov/cgi-progs/profile?s={dam_abbr}<br/>
         ({dam_abbr} in http://cdec.water.ca.gov/misc/daily_res.html)
