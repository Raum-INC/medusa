import { PaginatedResponse } from "@medusajs/types"
import qs from "qs"
import { ResponsePromise } from "../../typings"
import BaseResource from "../base"

class AdminCitiesResource extends BaseResource {

  /**
   * @description lists cities matching a query
   * @param query query for searching cities
   * @param customHeaders
   * @returns a list of cities matching the query.
   */
  list(
    query?: {state_id: number},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<PaginatedResponse & {cities: {id: number, name: string}[]}> {
    let path = `/admin/cities`

    if (query) {
      const queryString = qs.stringify(query)
      path = `/admin/cities?${queryString}`
    }

    return this.client.request("GET", path, undefined, {}, customHeaders)
  }
}

export default AdminCitiesResource
