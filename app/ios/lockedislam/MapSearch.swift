import Foundation
import MapKit
import React

@objc(MapSearch)
class MapSearch: NSObject, RCTBridgeModule {
  static func moduleName() -> String! { "MapSearch" }

  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func search(_ query: String,
                    centerLat: NSNumber,
                    centerLng: NSNumber,
                    radiusMeters: NSNumber,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    runSearch(query: query,
              coordinate: CLLocationCoordinate2D(latitude: centerLat.doubleValue,
                                                 longitude: centerLng.doubleValue),
              radius: radiusMeters.doubleValue,
              resolve: resolve,
              reject: reject)
  }

  @objc func geocode(_ address: String,
                     resolver resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    let geocoder = CLGeocoder()
    geocoder.geocodeAddressString(address) { placemarks, error in
      if let error = error {
        reject("GEOCODE_ERROR", error.localizedDescription, error)
        return
      }

      guard let location = placemarks?.first?.location else {
        resolve(NSNull())
        return
      }

      resolve([
        "lat": location.coordinate.latitude,
        "lng": location.coordinate.longitude,
      ])
    }
  }

  private func runSearch(query: String,
                         coordinate: CLLocationCoordinate2D,
                         radius: CLLocationDistance,
                         resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    // Ensure minimum search radius of 8km
    let searchRadius = max(radius, 8_000)
    let span = spanFor(radius: searchRadius, center: coordinate)
    let region = MKCoordinateRegion(center: coordinate, span: span)

    let request = MKLocalSearch.Request()
    request.region = region
    
    // Request POI results (iOS 13+)
    if #available(iOS 13.0, *) {
      request.resultTypes = [.pointOfInterest]
      // Don't set pointOfInterestFilter - it would include all places of worship
      // Instead, rely on natural language query + client-side filtering for mosques only
    }
    
    // Natural language query is required for mosque-specific results
    // If empty, we'll still get POIs but client-side filtering will narrow to mosques
    if !query.isEmpty {
      request.naturalLanguageQuery = query
    }

    DispatchQueue.main.async {
      MKLocalSearch(request: request).start { response, error in
        if let error = error {
          reject("SEARCH_ERROR", error.localizedDescription, error)
          return
        }

        guard let mapItems = response?.mapItems else {
          resolve([])
          return
        }

        // Filter results to within the requested radius (client-side validation)
        let filteredItems = mapItems.filter { item in
          let itemLocation = CLLocation(latitude: item.placemark.coordinate.latitude,
                                       longitude: item.placemark.coordinate.longitude)
          let centerLocation = CLLocation(latitude: coordinate.latitude,
                                         longitude: coordinate.longitude)
          let distance = itemLocation.distance(from: centerLocation)
          return distance <= searchRadius
        }

        let payload: [[String: Any]] = filteredItems.map { item in
          let placemark = item.placemark
          let subtitleParts: [String] = [
            placemark.subThoroughfare,
            placemark.thoroughfare,
            placemark.locality,
          ].compactMap { $0 }

          var result: [String: Any] = [
            // Use "unnamed" fallback instead of UUID to ensure stable keys for FlatList
            "id": "\(placemark.coordinate.latitude)-\(placemark.coordinate.longitude)-\(item.name ?? "unnamed")",
            "name": item.name ?? "",
            "subtitle": subtitleParts.joined(separator: " "),
            "lat": placemark.coordinate.latitude,
            "lng": placemark.coordinate.longitude,
          ]

          if let phone = item.phoneNumber {
            result["phone"] = phone
          }

          if let url = item.url?.absoluteString {
            result["url"] = url
          }

          if #available(iOS 13.0, *) {
            result["category"] = item.pointOfInterestCategory?.rawValue ?? "unknown"
          } else {
            result["category"] = "unknown"
          }

          return result
        }

        resolve(payload)
      }
    }
  }

  private func spanFor(radius: CLLocationDistance,
                       center: CLLocationCoordinate2D) -> MKCoordinateSpan {
    let earthRadiusLat: CLLocationDistance = 111_000 // meters per degree latitude
    let minLatitudeDelta = radius / earthRadiusLat
    let cosLat = cos(center.latitude * .pi / 180.0)
    let minLongitudeDelta = radius / max(earthRadiusLat * max(cosLat, 0.1), 0.1)

    return MKCoordinateSpan(latitudeDelta: minLatitudeDelta * 2,
                            longitudeDelta: minLongitudeDelta * 2)
  }
}


