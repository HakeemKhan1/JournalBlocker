#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MapSearch, NSObject)

RCT_EXTERN_METHOD(search:(NSString *)query
                  centerLat:(nonnull NSNumber *)centerLat
                  centerLng:(nonnull NSNumber *)centerLng
                  radiusMeters:(nonnull NSNumber *)radiusMeters
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(geocode:(NSString *)address
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end


