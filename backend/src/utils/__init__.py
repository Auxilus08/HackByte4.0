"""
Utility helpers for converting between PostGIS geometry (WKB/WKT)
and the LatLng Pydantic model used by the API.
"""

from geoalchemy2.shape import to_shape, from_shape
from shapely.geometry import Point

from src.schemas.accident import LatLng


def latlng_to_wkb(latlng: LatLng) -> str:
    """Convert a LatLng object to a WKT string for PostGIS insertion.

    PostGIS POINT uses (longitude, latitude) ordering.
    """
    point = Point(latlng.lng, latlng.lat)
    return from_shape(point, srid=4326)


def geom_to_latlng(geom) -> LatLng | None:
    """Convert a GeoAlchemy2 geometry element to a LatLng object.

    Returns None if the geometry is None.
    """
    if geom is None:
        return None
    point = to_shape(geom)
    return LatLng(lat=point.y, lng=point.x)
