import pathlib
import random
import json
from pyproj import Proj


def generate_utm_coordinates(zone):
    proj_utm = Proj(proj='utm', zone=zone, ellps='WGS84')
    lat_min, lat_max = 0, 84  # UTM applicable range for latitudes
    lon_min, lon_max = -180 + (zone - 1) * 6, -180 + zone * 6
    lat = random.uniform(lat_min, lat_max)
    lon = random.uniform(lon_min, lon_max)
    easting, northing = proj_utm(lon, lat)
    return lat, lon, easting, northing


def save_test_cases(num_files=10, cases_per_file=1000, zone=29):
    for file_num in range(1, num_files + 1):
        test_cases = []
        for _ in range(cases_per_file):
            lat, lon, easting, northing = generate_utm_coordinates(zone + file_num)
            test_case = {
                "latitude": lat,
                "longitude": lon,
                "easting": easting,
                "northing": northing
            }
            test_cases.append(test_case)

        # Save each file with 100 test cases
        file_name = pathlib.Path(__file__).parents[2] / f"tests/test_cases_{file_num}.json"
        with open(file_name, 'w') as file:
            json.dump(test_cases, file, indent=4)
        print(f"Saved {file_name} with {cases_per_file} test cases.")


if __name__ == "__main__":
    save_test_cases()

