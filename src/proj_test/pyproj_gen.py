import pathlib
import random
import json
from pyproj import Proj, CRS, Transformer

def generate_utm_coordinates(zone):
    proj_utm = Proj(proj="utm", zone=zone, ellps="WGS84")
    lat_min, lat_max = 0, 84  # UTM applicable range for latitudes
    lon_min, lon_max = -180 + (zone - 1) * 6, -180 + zone * 6
    lat = random.uniform(lat_min, lat_max)
    lon = random.uniform(lon_min, lon_max)
    easting, northing = proj_utm(lon, lat)
    return lat, lon, easting, northing

def utm_to_lon_lat(
    coordinates: list[tuple[float, float]],
    utm_zone_number: int,
    utm_zone_letter: str,
) -> list[tuple[float, float]]:
    """
    Convert UTM coordinates to longitude latitude coordinates.

    Args:
        coordinates: UTM coordinates to convert.
        utm_zone_number: UTM zone number.
        utm_zone_letter: UTM zone letter.

    Returns:
        Longitude, latitude coordinates ordered per GeoJSON spec.
    """
    is_south_hemisphere = utm_zone_letter < "N"
    utm_crs = CRS.from_dict(
        {"proj": "utm", "zone": utm_zone_number, "south": is_south_hemisphere}
    )
    wgs84_crs = CRS.from_epsg(4326)
    transformer = Transformer.from_crs(utm_crs, wgs84_crs, always_xy=True)

    lon_lat_coordinates = [
        transformer.transform(easting, northing) for easting, northing in coordinates
    ]
    return lon_lat_coordinates

def save_test_cases(num_files=10, cases_per_file=100, zone=29):
    for file_num in range(1, num_files + 1):
        test_cases = []
        for _ in range(cases_per_file):
            lat, lon, easting, northing = generate_utm_coordinates(zone + file_num)
            utm_coords = [(easting, northing)]
            lon_lat = utm_to_lon_lat(utm_coords, zone + file_num, "N")  # Assuming northern hemisphere

            test_case = {
                "latitude": lat,
                "longitude": lon,
                "easting": easting,
                "northing": northing,
                "converted_latitude": lon_lat[0][1],
                "converted_longitude": lon_lat[0][0],
            }
            test_cases.append(test_case)

        # Save each file with 100 test cases
        file_name = pathlib.Path(__file__).parents[2] / f"tests/test_cases_{file_num}.json"
        with open(file_name, "w") as file:
            json.dump(test_cases, file, indent=4)
        print(f"Saved {file_name} with {cases_per_file} test cases.")

if __name__ == "__main__":
    save_test_cases()

