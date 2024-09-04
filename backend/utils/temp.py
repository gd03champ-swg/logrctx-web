import requests
import json
import datetime
import pytz

host = 'logrctx'
curr_datetime = datetime.datetime.now(pytz.timezone('Asia/Yekaterinburg')).isoformat('T')
msg = '[WARN] On server {host} detected error'.format(host=host)

url = 'http://127.0.0.1:3100/loki/api/v1/push'
headers = {'Content-type': 'application/json'}
payload = {
    'streams': [{
        'labels': f'service="logrctx", host="{host}"',
        'entries': [{'ts': curr_datetime, 'line': msg}]
    }]
}

response = requests.post(url, json=payload, auth=('swiggy-admin-user', 'FVEdQ9m08RAiOx2g9Ayi5kaGO3yIlqiPXSSHoSYE'))
print(response.status_code)
print(response.text)