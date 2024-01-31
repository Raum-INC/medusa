import FormValidator from "../../../../utils/form-validator"
import { NestedForm } from "../../../../utils/nested-form"
import InputField from "../../../molecules/input"
import { Location, LocationSelector } from "mapbox-location-selector-react"
import "mapbox-gl/dist/mapbox-gl.css"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import "mapbox-location-selector-react/styles"
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding"
import { createRef, useEffect, useMemo, useState } from "react"
import { Controller, useFieldArray } from "react-hook-form"
import { NextSelect } from "../../../molecules/select/next-select"
import { useAdminStates, useAdminCities, useMedusa } from "medusa-react"

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZ3JpbW5vZWwiLCJhIjoiY2wyYTg1a3ZuMDBhcTNvbzgybjBla2l3ZiJ9.sVECmUo6Uvrvz7mrxz_S8Q"
// stylesService exposes listStyles(), createStyle(), getStyle(), etc.
const geocodingService = mbxGeocoding({
  accessToken: MAPBOX_ACCESS_TOKEN,
})

export type LocationFormType = {
  address: string | null
  latitude: number | null
  longitude: number | null
  state: { value: number; label: string } | null
  city: { value: number; label: string } | null
}

type LocationFormProps = {
  form: NestedForm<LocationFormType>
}

/**
 * Re-usable nested form used to submit dimensions information for products and their variants.
 * @example
 * <LocationForm form={nestedForm(form, "dimensions")} />
 */
const LocationForm = ({ form }: LocationFormProps) => {
  const {
    register,
    path,
    control,
    setValue,
    formState: { errors },
  } = form

  const { client: medusaClient } = useMedusa()

  const [states, setStates] = useState<{ id: number; name: string }[]>([])
  const [selectedState, setSelectedState] = useState<{
    value: number
    label: string
  }>()
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    medusaClient.admin.states
      .list()
      .then((data) => setStates(data.states))
      .catch((error) => console.error("Error fetching states:", error))
  }, [])

  useEffect(() => {
    // Fetch the list of cities based on the selected state
    if (selectedState || (control._formValues.geolocation as LocationFormType).state?.value) {
      medusaClient.admin.cities
        .list({ state_id: selectedState?.value ?? (control._formValues.geolocation as LocationFormType).state!.value })
        .then((data) => setCities(data.cities))
        .catch((error) => console.error("Error fetching cities:", error))
    }
  }, [selectedState])

  return (
    <>
      <Controller
        control={control}
        name={"geolocation" as any}
        render={({
          field: { onChange, onBlur, value, ref },
          formState,
          fieldState,
        }) => (
          <>
            <div className="gap-large grid grid-cols-4">
              <div className="gap-large col-span-2 grid grid-cols-2">
                <InputField
                  label="Latitude"
                  disabled
                  required
                  value={value?.latitude || ""}
                  placeholder="Latitude"
                  {...register(path("latitude"), {
                    valueAsNumber: true,
                  })}
                  errors={errors}
                />
                <InputField
                  label="Longitude"
                  disabled
                  required
                  value={value?.longitude || ""}
                  placeholder="Longitude"
                  {...register(path("longitude"), {
                    valueAsNumber: true,
                  })}
                  errors={errors}
                />
              </div>

              <div className="col-span-2">
                <InputField
                  label="Address"
                  required
                  value={value?.address || ""}
                  placeholder="12b, Pelican Estate, Ikeja, Lagos 400102"
                  {...register(path("address"), {
                    required: "Address is required",
                  })}
                  onChange={(e) =>
                    onChange({
                      latitude: value?.latitude,
                      longitude: value?.longitude,
                      address: e.target.value,
                      state: value?.state,
                      city: value?.city,
                    })
                  }
                  errors={errors}
                />
              </div>

              <div className="col-span-4" style={{ minHeight: 300 }}>
                {useMemo(
                  () => (
                    <LocationSelector
                      initialLocation={{
                        lat: value?.latitude,
                        lng: value?.longitude,
                      }}
                      initialView={{
                        zoom: 18,
                        latitude: value?.latitude ?? 6.522287,
                        longitude: value?.longitude ?? 3.380631,
                      }}
                      onLocationChange={async (location) => {
                        if (!location) return

                        onChange({
                          latitude: location?.lat,
                          longitude: location?.lng,
                          address: value?.address,
                          state: value?.state,
                          city: value?.city,
                        })

                        const match = await geocodingService
                          .reverseGeocode({
                            query: [location.lat, location.lng],
                          })
                          .send()

                        console.error(match.body)
                        const address = match.body.features.find((x) =>
                          x.place_type.includes("address")
                        )?.place_name
                        if (!address) return

                        console.error(address)

                        onChange({
                          latitude: location?.lat,
                          longitude: location?.lng,
                          address,
                          state: value?.state,
                          city: value?.city,
                        })
                      }}
                      accessToken={MAPBOX_ACCESS_TOKEN}
                    />
                  ),
                  []
                )}
              </div>

              <div className="gap-large col-span-4 grid grid-cols-3">
                <div>
                  <NextSelect
                    required={true}
                    placeholder="Choose state"
                    isMulti={false}
                    {...register(path("state"), {
                      required: true,
                    })}
                    options={(states ?? []).map(
                      (state: { id: number; name: string }) => {
                        return {
                          value: state.id,
                          label: state.name,
                        }
                      }
                    )}
                    value={value?.state}
                    onChange={(e) => {
                      onChange({
                        latitude: value?.latitude,
                        longitude: value?.longitude,
                        address: value?.address,
                        state: e,
                        city: null,
                      })
                      console.error(e)
                      setSelectedState(e)
                    }}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <NextSelect
                    placeholder={"Choose City"}
                    required={true}
                    isMulti={false}
                    {...register(path("city"), {
                      required: true,
                    })}
                    options={(cities ?? []).map(
                      (city: { id: number; name: string }) => {
                        return {
                          value: city.id,
                          label: city.name,
                        }
                      }
                    )}
                    value={value?.city}
                    onChange={(e) => {
                      onChange({
                        latitude: value?.latitude,
                        longitude: value?.longitude,
                        address: value?.address,
                        state: value?.state,
                        city: e,
                      })
                    }}
                    onBlur={onBlur}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      />
    </>
  )
}

export default LocationForm
