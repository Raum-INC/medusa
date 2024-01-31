import { Response } from "@medusajs/medusa-js"
import { useQuery } from "@tanstack/react-query"
import { useMedusa } from "../../../contexts"
import { UseQueryOptionsWrapper } from "../../../types"
import { queryKeysFactory } from "../../utils/index"
import { PaginatedResponse } from "@medusajs/types"

const ADMIN_CITIES_QUERY_KEY = `admin_cities` as const

export const adminCitiesKeys = queryKeysFactory(ADMIN_CITIES_QUERY_KEY)

type CitiesQueryKeys = typeof adminCitiesKeys

export const useAdminCities = (
  query?: { state_id: number },
  options?: UseQueryOptionsWrapper<
    Response<PaginatedResponse & { cities: { id: number; name: string }[] }>,
    Error,
    ReturnType<CitiesQueryKeys["list"]>
  >
) => {
  const { client } = useMedusa()
  const { data, ...rest } = useQuery(
    adminCitiesKeys.list(query),
    () => client.admin.cities.list(query),
    options
  )
  return { ...data, ...rest } as const
}
