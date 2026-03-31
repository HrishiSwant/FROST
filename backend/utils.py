import requests

def get_ip_info(ip):
    try:
        data = requests.get(f"http://ip-api.com/json/{ip}", timeout=5).json()
        return {
            "country": data.get("country"),
            "isp": data.get("isp")
        }
    except:
        return {}
