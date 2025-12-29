#!/usr/bin/env python3
"""
Open-Meteo 天气查询工具
无需 API Key，开箱即用
注意：请使用英文或拼音输入城市名（如: Beijing, Shanghai, Kunming）
"""

import requests
import sys
from datetime import datetime

def geocoding(city_name):
    """将城市名转换为经纬度"""
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1&format=json"
    response = requests.get(url)
    data = response.json()
    
    if not data.get("results"):
        return None, None, None, None
    
    result = data["results"][0]
    return result["latitude"], result["longitude"], result["name"], result["country"]

def get_weather(lat, lon, city_name, country):
    """获取天气数据"""
    # 获取当前天气和7天预报
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto"
    
    response = requests.get(url)
    data = response.json()
    
    # 天气代码映射
    weather_codes = {
        0: "晴朗", 1: "多云", 2: "多云", 3: "阴天",
        45: "雾", 48: "雾凇",
        51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨",
        61: "小雨", 63: "中雨", 65: "大雨",
        71: "小雪", 73: "中雪", 75: "大雪",
        80: "阵雨", 81: "阵雨", 82: "暴雨",
        95: "雷阵雨", 96: "雷阵雨伴冰雹", 99: "大雷阵雨伴冰雹"
    }
    
    # 当前天气
    current = data["current"]
    daily = data["daily"]
    
    weather_desc = weather_codes.get(current["weather_code"], "未知")
    
    # 输出格式化结果
    print(f"\n{'='*50}")
    print(f"📍 {city_name}, {country}")
    print(f"{'='*50}")
    print(f"🌤️  当前天气: {weather_desc}")
    print(f"🌡️  温度: {current['temperature_2m']}°C")
    print(f"💧 湿度: {current['relative_humidity_2m']}%")
    print(f"💨 风速: {current['wind_speed_10m']} km/h")
    print(f"\n📅 未来3天预报:")
    print(f"{'-'*50}")
    
    for i in range(min(3, len(daily["time"]))):
        date = daily["time"][i]
        high = daily["temperature_2m_max"][i]
        low = daily["temperature_2m_min"][i]
        code = daily["weather_code"][i]
        desc = weather_codes.get(code, "未知")
        
        print(f"📆 {date}: {desc}, {high}°C / {low}°C")
    
    print(f"{'='*50}\n")

def main():
    if len(sys.argv) < 2:
        print("用法: python weather_tool.py <城市名>")
        print("示例: python weather_tool.py Beijing")
        print("提示: 请使用英文或拼音输入城市名（如: Beijing, Shanghai, Kunming, London）")
        sys.exit(1)
    
    city_name = sys.argv[1]
    
    print(f"正在查询 {city_name} 的天气...")
    
    # 获取经纬度
    lat, lon, name, country = geocoding(city_name)
    
    if lat is None:
        print(f"❌ 未找到城市: {city_name}")
        print("提示: 请尝试使用英文或拼音（例如: Beijing, Shanghai, Kunming）")
        sys.exit(1)
    
    # 获取天气
    get_weather(lat, lon, name, country)

if __name__ == "__main__":
    main()
