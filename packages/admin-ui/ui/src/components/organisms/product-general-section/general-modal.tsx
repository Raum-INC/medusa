import { useTranslation } from "react-i18next"
import DiscountableForm, {
  DiscountableFormType,
} from "../../forms/product/discountable-form"
import GeneralForm, { GeneralFormType } from "../../forms/product/general-form"
import OrganizeForm, {
  OrganizeFormType,
} from "../../forms/product/organize-form"

import { Product } from "@medusajs/medusa"
import { reduce } from "lodash"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import useEditProductActions from "../../../hooks/use-edit-product-actions"
import { nestedForm } from "../../../utils/nested-form"
import MetadataForm, {
  getMetadataFormValues,
  getSubmittableMetadata,
  MetadataFormType,
} from "../../forms/general/metadata-form"
import Button from "../../fundamentals/button"
import Modal from "../../molecules/modal"
import LocationForm, {
  LocationFormType,
} from "../../forms/product/location-form"
import FeaturesForm, {
  FeaturesFormType,
} from "../../forms/product/features-form"
import { PricesFormType } from "../../forms/general/prices-form"
import { entries } from "lodash"
import CautionFeesForm from "../../forms/product/caution-fees-form"
type Props = {
  product: Product
  open: boolean
  onClose: () => void
}

type GeneralFormWrapper = {
  geolocation: LocationFormType
  general: GeneralFormType
  organize: OrganizeFormType
  discountable: DiscountableFormType
  metadata: MetadataFormType
  cautionFees: PricesFormType
  features: FeaturesFormType
}

const GeneralModal = ({ product, open, onClose }: Props) => {
  const { t } = useTranslation()
  const { onUpdate, updating } = useEditProductActions(product.id)
  const form = useForm<GeneralFormWrapper>({
    defaultValues: getDefaultValues(product),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  useEffect(() => {
    reset(getDefaultValues(product))
  }, [product, reset])

  const onReset = () => {
    reset(getDefaultValues(product))
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    onUpdate(
      {
        title: data.general.title,
        handle: data.general.handle,
        // @ts-ignore
        material: data.general.material,
        // @ts-ignore
        subtitle: data.general.subtitle,
        // @ts-ignore
        description: data.general.description,
        latitude: data.geolocation.latitude,
        longitude: data.geolocation.longitude,
        address: data.geolocation.address,
        state_id: data.geolocation.state?.value,
        city_id: data.geolocation.city?.value,
        generalAddressArea: `${data.geolocation.city?.label}, ${data.geolocation.state?.label}`,
        // @ts-ignore
        type: data.organize.type
          ? {
              id: data.organize.type.value,
              value: data.organize.type.label,
            }
          : null,
        // @ts-ignore
        collection_id: data.organize.collection
          ? data.organize.collection.value
          : null,
        // @ts-ignore
        tags: data.organize.tags
          ? data.organize.tags.map((t) => ({ value: t }))
          : null,

        categories: data.organize?.categories?.length
          ? data.organize.categories.map((id) => ({ id }))
          : [],
        discountable: data.discountable.value,
        cautionFees: reduce(
          data.cautionFees.prices.map((entry) => ({
            [`prices_${entry.currency_code}`]: entry.amount,
          })),
          (a, b) => ({ ...a, ...b })
        ),
        metadata: {
          ...getSubmittableMetadata(data.metadata),

          parameters: data.features.parameters,
          facilities: reduce(
            data.features.facilities.map((facility) => ({ [facility]: 1 })),
            (a, b) => ({ ...a, ...b })
          ),
          safety_items: reduce(
            data.features.safety_items.map((safety_item) => ({
              [safety_item]: 1,
            })),
            (a, b) => ({ ...a, ...b })
          ),
        },
      },
      onReset
    )
  })

  return (
    <Modal open={open} handleClose={onReset} isLargeModal>
      <Modal.Body>
        <Modal.Header handleClose={onReset}>
          <h1 className="inter-xlarge-semibold m-0">
            {t(
              "product-general-section-edit-general-information",
              "Edit General Information"
            )}
          </h1>
        </Modal.Header>
        <form onSubmit={onSubmit}>
          <Modal.Content>
            <GeneralForm
              form={nestedForm(form, "general")}
              isGiftCard={product.is_giftcard}
            />

            <div className="my-xlarge">
              <h2 className="inter-base-semibold mb-base">
                Details, Facilities & Safety Features
              </h2>
              <FeaturesForm form={nestedForm(form, "features")} />
            </div>

            <div className="my-xlarge">
              <h2 className="inter-base-semibold mb-base">Location</h2>
              <LocationForm form={nestedForm(form, "geolocation")} />
            </div>

            <div className="my-xlarge">
              <h2 className="inter-base-semibold mb-base">
                Organize{" "}
                {product.is_giftcard
                  ? t("product-general-section-gift-card", "Gift Card")
                  : t("product-general-section-product", "Product")}
              </h2>
              <OrganizeForm form={nestedForm(form, "organize")} />
            </div>
            <DiscountableForm
              form={nestedForm(form, "discountable")}
              isGiftCard={product.is_giftcard}
            />

            <div className="mt-xlarge">
              <h2 className="inter-base-semibold mb-2xsmall">
                {'Caution Fees'}
              </h2>
              <CautionFeesForm form={nestedForm(form, "cautionFees")} />
            </div>

            <div className="mt-xlarge">
              <h2 className="inter-base-semibold mb-base">
                {t("product-general-section-metadata", "Metadata")}
              </h2>
              <MetadataForm form={nestedForm(form, "metadata")} />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex w-full justify-end gap-x-2">
              <Button
                size="small"
                variant="secondary"
                type="button"
                onClick={onReset}
              >
                {t("product-general-section-cancel", "Cancel")}
              </Button>
              <Button
                size="small"
                variant="primary"
                type="submit"
                disabled={!isDirty}
                loading={updating}
              >
                {t("product-general-section-save", "Save")}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  )
}

const getDefaultValues = (product: Product): GeneralFormWrapper => {
  return {
    general: {
      title: product.title,
      subtitle: product.subtitle,
      material: product.material,
      handle: product.handle!,
      description: product.description || null,
    },
    features: {
      facilities: Object.keys(product.metadata?.facilities ?? {}),
      safety_items: Object.keys(product.metadata?.safety_items ?? {}),
      parameters: (product.metadata?.parameters as any) ?? {},
    },
    organize: {
      collection: product.collection
        ? { label: product.collection.title, value: product.collection.id }
        : null,
      type: product.type
        ? { label: product.type.value, value: product.type.id }
        : null,
      tags: product.tags ? product.tags.map((t) => t.value) : null,
      categories: product.categories?.map((c) => c.id),
    },
    discountable: {
      value: product.discountable,
    },
    geolocation: {
      address: product.address,
      latitude: product.latitude,
      longitude: product.longitude,
      city: { value: product.city.id, label: product.city.name },
      state: { value: product.state.id, label: product.state.name },
    },
    metadata: getMetadataFormValues(product.metadata),
    cautionFees: {
      prices: entries(product.cautionFees).map((entry) => ({
        id: entry[0],
        includes_tax: false,
        currency_code: entry[0].split("_")[1],
        region_id: null,
        amount: entry[1],
      })),
    },
  };
}

export default GeneralModal
