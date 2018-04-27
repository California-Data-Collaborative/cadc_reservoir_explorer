import pandas as pd 

daily = pd.read_csv("Daily.csv")
static = pd.read_csv("Static.csv")

data = pd.merge(static, daily, on='Dam_ABBR')

del data['Unnamed: 0_x']
del data['Unnamed: 0_y']
data['Percent%'] = 100.0 * data['STORAGE'] / data['Capacity']
data.to_csv("data.csv")