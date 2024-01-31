import { useAdminStore } from "medusa-react"
import FormValidator from "../../../../utils/form-validator"
import { NestedForm } from "../../../../utils/nested-form"
import InputField from "../../../molecules/input"
import { createRef, useMemo, useState } from "react"
import { Controller, useFieldArray } from "react-hook-form"
import { Icon } from "@radix-ui/react-select"
import { Store } from "@medusajs/medusa/dist/models"
import InputHeader from "../../../fundamentals/input-header"
import NestedMultiselect from "../../../../domain/categories/components/multiselect"

export type FeaturesFormType = {
  parameters: Record<"beds" | "baths" | "area", number|null>
  facilities: string[]
  safety_items: string[]
}

type FacilitiesFormProps = {
  form: NestedForm<FeaturesFormType>
}

/**
 * Re-usable nested form used to submit dimensions information for products and their variants.
 * @example
 * <FacilitiesForm form={nestedForm(form, "dimensions")} />
 */
const FeaturesForm = ({ form }: FacilitiesFormProps) => {
  const {
    register,
    path,
    control,
    setValue,
    formState: { errors },
  } = form

  const { store } = useAdminStore()
  const castedStore: Store & {
    metadata: {
      facilities: { tag: string }[]
      safety_items: { tag: string }[]
    }
  } = store as any

  return (
    <>
      <div className="gap-large grid grid-cols-2">
        <div className="gap-large col-span-2 grid grid-cols-3">
          <InputField
            label="Area"
            placeholder="2000sqft"
            type="number"
            {...register(path("parameters.area"), {
              min: FormValidator.nonNegativeNumberRule("Area"),
              valueAsNumber: true,
            })}
            errors={errors}
          />
          <InputField
            label="Baths"
            placeholder="3"
            type="number"
            {...register(path("parameters.baths"), {
              min: FormValidator.nonNegativeNumberRule("Baths"),
              valueAsNumber: true,
            })}
            errors={errors}
          />
          <InputField
            label="Bedrooms"
            placeholder="3"
            type="number"
            {...register(path("parameters.beds"), {
              min: FormValidator.nonNegativeNumberRule("Beds"),
              valueAsNumber: true,
            })}
            errors={errors}
          />
        </div>
        <div>
          <InputHeader label="Facilities" className="mb-2" />
          <Controller
            name={path("facilities")}
            control={control}
            render={({ field: { value, onChange } }) => {
              const initiallySelected = (value || []).reduce((acc, val) => {
                acc[val] = true
                return acc
              }, {} as Record<string, true>)

              return (
                <NestedMultiselect
                  placeholder={
                    !!castedStore?.metadata?.facilities?.length
                      ? "Choose facilities"
                      : "No facilities available"
                  }
                  onSelect={onChange}
                  options={castedStore?.metadata?.facilities?.map(
                    (facility) => ({ label: facility.tag, value: facility.tag })
                  )}
                  initiallySelected={initiallySelected}
                />
              )
            }}
          />
        </div>
        <div>
          <InputHeader label="Safety Fetures" className="mb-2" />
          <Controller
            name={path("safety_items")}
            control={control}
            render={({ field: { value, onChange } }) => {
              const initiallySelected = (value || []).reduce((acc, val) => {
                acc[val] = true
                return acc
              }, {} as Record<string, true>)

              return (
                <NestedMultiselect
                  placeholder={
                    !!castedStore?.metadata?.safety_items?.length
                      ? "Choose Safety Features"
                      : "No Safety Features available"
                  }
                  onSelect={onChange}
                  options={castedStore?.metadata?.safety_items?.map(
                    (safety_item) => ({
                      label: safety_item.tag,
                      value: safety_item.tag,
                    })
                  )}
                  initiallySelected={initiallySelected}
                />
              )
            }}
          />
        </div>
      </div>
    </>
  )
}

export default FeaturesForm
