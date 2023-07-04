import { MedusaModule } from "@medusajs/modules-sdk"
import { Product } from "@models"
import { initialize } from "../../src"
import * as CustomRepositories from "../__fixtures__/module"
import { ProductRepository } from "../__fixtures__/module"
import { createProductAndTags } from "../__fixtures__/product"
import { productsData } from "../__fixtures__/product/data"
import { DB_URL, TestDatabase } from "../utils"
import { buildProductData } from "../__fixtures__/product/data/create-product"
import { kebabCase } from "@medusajs/utils"
import { ProductModuleService } from "@services"

const beforeEach_ = async () => {
  await TestDatabase.setupDatabase()
  return await TestDatabase.forkManager()
}

const afterEach_ = async () => {
  await TestDatabase.clearDatabase()
}

describe("Product module", function () {
  describe("Using built-in data access layer", function () {
    let module: ProductModuleService
    let products: Product[]

    beforeEach(async () => {
      const testManager = await beforeEach_()
      products = await createProductAndTags(testManager, productsData)

      module = (await initialize({
        database: {
          clientUrl: DB_URL,
          schema: process.env.MEDUSA_PRODUCT_DB_SCHEMA,
        },
      })) as ProductModuleService
    })

    afterEach(afterEach_)

    it("should initialize", async () => {
      expect(module).toBeDefined()
    })

    it("should return a list of product", async () => {
      const products = await module.list()
      expect(products).toHaveLength(2)
    })
  })

  describe("Using custom data access layer", function () {
    let module: ProductModuleService
    let products: Product[]

    beforeEach(async () => {
      const testManager = await beforeEach_()

      products = await createProductAndTags(testManager, productsData)

      module = (await initialize({
        database: {
          clientUrl: DB_URL,
          schema: process.env.MEDUSA_PRODUCT_DB_SCHEMA,
        },
        repositories: CustomRepositories,
      })) as ProductModuleService
    })

    afterEach(afterEach_)

    it("should initialize", async () => {
      expect(module).toBeDefined()
    })

    it("should return a list of product", async () => {
      const products = await module.list()

      expect(ProductRepository.prototype.find).toHaveBeenCalled()
      expect(products).toHaveLength(0)
    })
  })

  describe("Using custom data access layer and connection", function () {
    let module: ProductModuleService
    let products: Product[]

    beforeEach(async () => {
      const testManager = await beforeEach_()
      products = await createProductAndTags(testManager, productsData)

      MedusaModule.clearInstances()

      module = (await initialize({
        manager: testManager,
        repositories: CustomRepositories,
      })) as ProductModuleService
    })

    afterEach(afterEach_)

    it("should initialize and return a list of product", async () => {
      expect(module).toBeDefined()
    })

    it("should return a list of product", async () => {
      const products = await module.list()

      expect(ProductRepository.prototype.find).toHaveBeenCalled()
      expect(products).toHaveLength(0)
    })
  })

  describe("create", function () {
    let module: ProductModuleService
    let images = ["image-1"]

    beforeEach(async () => {
      await beforeEach_()

      MedusaModule.clearInstances()

      module = (await initialize({
        database: {
          clientUrl: DB_URL,
          schema: process.env.MEDUSA_PRODUCT_DB_SCHEMA,
        },
      })) as ProductModuleService
    })

    afterEach(afterEach_)

    it("should create a product", async () => {
      const data = buildProductData({
        images,
        thumbnail: images[0],
      })

      const products = await module.create([data])

      expect(products.length).toBe(1)

      expect(products[0].images.length).toBe(1)
      expect(products[0].options.length).toBe(1)
      expect(products[0].tags.length).toBe(1)
      expect(products[0].categories?.length).toBe(0)
      expect(products[0].variants.length).toBe(1)

      expect(products[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: data.title,
          handle: kebabCase(data.title),
          description: data.description,
          subtitle: data.subtitle,
          is_giftcard: data.is_giftcard,
          discountable: data.discountable,
          thumbnail: images[0],
          status: data.status,
          images: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              url: images[0],
            }),
          ]),
          options: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: data.options[0].title,
              values: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  value: data.variants[0].options?.[0].value,
                }),
              ]),
            }),
          ]),
          tags: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              value: data.tags[0].value,
            }),
          ]),
          type: expect.objectContaining({
            id: expect.any(String),
            value: data.type.value,
          }),
          variants: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: data.variants[0].title,
              sku: data.variants[0].sku,
              allow_backorder: false,
              manage_inventory: true,
              inventory_quantity: 100,
              variant_rank: 0,
              options: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  value: data.variants[0].options?.[0].value,
                }),
              ]),
            }),
          ]),
        })
      )
    })
  })
})
