import { Store } from "@medusajs/medusa"
import {
  useAdminProductTags,
  useAdminStore,
  useAdminUpdateStore,
  useProductTags,
} from "medusa-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import BackButton from "../../components/atoms/back-button"
import Input from "../../components/molecules/input"
import BodyCard from "../../components/organisms/body-card"
import useNotification from "../../hooks/use-notification"
import { getErrorMessage } from "../../utils/error-messages"
import TagInput from "../../components/molecules/tag-input"
import { omit, pick } from "lodash"
import InputHeader from "../../components/fundamentals/input-header"
import { ProductTag } from "@medusajs/client-types"
import NestedMultiselect from "../categories/components/multiselect"
import {reduce} from 'lodash'
type AccountDetailsFormData = {
  name: string
  swap_link_template: string | undefined
  payment_link_template: string | undefined
  invite_link_template: string | undefined
  facilities: string[] | undefined
  safety_items: string[] | undefined
  curation_tags: string[] | undefined
}

const AccountDetails = () => {
  const { register, reset, handleSubmit, control } =
    useForm<AccountDetailsFormData>()
  const { store } = useAdminStore({})
  const { mutate } = useAdminUpdateStore()
  const notification = useNotification()
  const { product_tags } = useAdminProductTags({ limit: 30, offset: 0 })
  const { t } = useTranslation()

  const handleCancel = () => {
    if (store) {
      reset(mapStoreDetails(store))
    }
  }

  useEffect(() => {
    handleCancel()
  }, [store])

  const onSubmit = (data: AccountDetailsFormData) => {
    const validateSwapLinkTemplate = validateUrl(data.swap_link_template)
    const validatePaymentLinkTemplate = validateUrl(data.payment_link_template)
    const validateInviteLinkTemplate = validateUrl(data.invite_link_template)

    if (!validateSwapLinkTemplate) {
      notification(
        t("settings-error", "Error"),
        t("settings-malformed-swap-url", "Malformed swap url"),
        "error"
      )
      return
    }

    if (!validatePaymentLinkTemplate) {
      notification(
        t("settings-error", "Error"),
        t("settings-malformed-payment-url", "Malformed payment url"),
        "error"
      )
      return
    }

    if (!validateInviteLinkTemplate) {
      notification(
        t("settings-error", "Error"),
        t("settings-malformed-invite-url", "Malformed invite url"),
        "error"
      )
      return
    }

    mutate(
      {
        ...omit(data, ["facilities", "safety_items", "curation_tags"]),
        metadata: {
          facilities: data.facilities?.map((entry) => ({ tag: entry })),
          safety_items: data.safety_items?.map((entry) => ({ tag: entry })),
          curation_tags: product_tags
            ?.filter((entry) =>
              data.curation_tags
                ? data.curation_tags.indexOf(entry.id) > -1
                : false
            )
            .map((entry) => pick(entry, ["id", "value"])),
        },
      },
      {
        onSuccess: () => {
          notification(
            t("settings-success", "Success"),
            t(
              "settings-successfully-updated-store",
              "Successfully updated store"
            ),
            "success"
          )
        },
        onError: (error) => {
          notification(
            t("settings-error", "Error"),
            getErrorMessage(error),
            "error"
          )
        },
      }
    )
  }

  return (
    <form className="flex-col py-5">
      <div className="max-w-[632px]">
        <BackButton
          path="/a/settings/"
          label={t("settings-back-to-settings", "Back to settings")}
          className="mb-xsmall"
        />
        <BodyCard
          events={[
            {
              label: t("settings-save", "Save"),
              type: "button",
              onClick: handleSubmit(onSubmit),
            },
            {
              label: t("settings-cancel", "Cancel"),
              type: "button",
              onClick: handleCancel,
            },
          ]}
          title={t("settings-store-details", "Store Details")}
          subtitle={t(
            "settings-manage-your-business-details",
            "Manage your business details"
          )}
        >
          <div className="gap-y-xlarge mb-large flex flex-col">
            <div>
              <h2 className="inter-base-semibold mb-base">
                {t("settings-general", "General")}
              </h2>
              <Input
                label={t("settings-store-name", "Store name")}
                {...register("name")}
                placeholder={t("settings-medusa-store", "Medusa Store")}
              />
            </div>
            <div>
              <h2 className="inter-base-semibold mb-base">
                {t("settings-advanced-settings", "Advanced settings")}
              </h2>
              <Input
                label={t("settings-swap-link-template", "Swap link template")}
                {...register("swap_link_template")}
                placeholder="https://acme.inc/swap={swap_id}"
              />
              <Input
                className="mt-base"
                label={t(
                  "settings-draft-order-link-template",
                  "Draft order link template"
                )}
                {...register("payment_link_template")}
                placeholder="https://acme.inc/payment={payment_id}"
              />
              <Input
                className="mt-base"
                label={t(
                  "settings-invite-link-template",
                  "Invite link template"
                )}
                {...register("invite_link_template")}
                placeholder="https://acme-admin.inc/invite?token={invite_token}"
              />
            </div>
            <div>
              <h2 className="inter-base-semibold mb-base">{"Metadata"}</h2>

              <div>
                <InputHeader label="Curation Tags" className="mb-2" />
                <Controller
                  name={"curation_tags"}
                  control={control}
                  render={({ field: { value, onChange } }) => {

              const initiallySelected = reduce(value || [], (acc, val) => {
                acc[val] = true
                return acc
              }, {} as Record<string, true>)

                    console.error("initially selected", initiallySelected)
                    return (
                      <NestedMultiselect
                        placeholder={
                          !!product_tags?.length
                            ? "Choose Curation Tags"
                            : "No Curation Tags available"
                        }
                        onSelect={onChange}
                        options={(product_tags ?? []).map((tag) => ({
                          label: tag.value,
                          value: tag.id,
                        }))}
                        initiallySelected={initiallySelected}
                      />
                    )
                  }}
                />
              </div>
              <div className="mb-large" />
              <Controller
                control={control}
                name={"facilities"}
                render={({ field: { value, onChange } }) => {
                  return (
                    <TagInput
                      label="Facilities"
                      onChange={onChange}
                      values={value || []}
                    />
                  )
                }}
              />
              <div className="mb-large" />
              <Controller
                control={control}
                name={"safety_items"}
                render={({ field: { value, onChange } }) => {
                  return (
                    <TagInput
                      label="Safety Items"
                      onChange={onChange}
                      values={value || []}
                    />
                  )
                }}
              />
            </div>
          </div>
        </BodyCard>
      </div>
    </form>
  )
}

const validateUrl = (address: string | undefined) => {
  if (!address || address === "") {
    return true
  }

  try {
    const url = new URL(address)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}

const mapStoreDetails = (store: Store): AccountDetailsFormData => {
  return {
    name: store.name,
    swap_link_template: store.swap_link_template,
    payment_link_template: store.payment_link_template,
    invite_link_template: store.invite_link_template,
    facilities: (store?.metadata?.facilities as Array<any> | undefined)?.map(
      (entry) => entry.tag
    ),
    safety_items: (
      store?.metadata?.safety_items as Array<any> | undefined
    )?.map((entry) => entry.tag),
    curation_tags: (
      store?.metadata?.curation_tags as Array<ProductTag> | undefined
    )?.map((entry) => entry.id),
  }
}

export default AccountDetails
