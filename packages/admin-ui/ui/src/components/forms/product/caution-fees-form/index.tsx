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
import PricesForm, { PricesFormType } from "../../general/prices-form"

type FacilitiesFormProps = {
  form: NestedForm<PricesFormType>
}

/**
 * Re-usable nested form used to edit caution fees for listed regions
 * @example
 * <CautionFeesForm form={nestedForm(form, "cautionFees")} />
 */
const CautionFeesForm = ({ form }: FacilitiesFormProps) => {
  return (
    <>
      <div>
        <p className="inter-base-regular text-grey-50">
          Configure the caution fees for this product.
        </p>
        <div className="pt-large">
          <PricesForm form={form} />
        </div>
      </div>
    </>
  )
}

export default CautionFeesForm
