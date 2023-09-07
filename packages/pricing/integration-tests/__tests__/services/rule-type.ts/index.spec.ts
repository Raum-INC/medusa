import { SqlEntityManager } from "@mikro-orm/postgresql"

import { Currency } from "@models"
import { RuleTypeRepository } from "@repositories"
import { RuleTypeService } from "@services"

import { createCurrencies } from "../../../__fixtures__/currency"
import { MikroOrmWrapper } from "../../../utils"
import { createRuleTypes } from "../../../__fixtures__/rule-type"

jest.setTimeout(30000)

describe("Currency Service", () => {
  let service: RuleTypeService
  let testManager: SqlEntityManager
  let repositoryManager: SqlEntityManager


  beforeEach(async () => {
    await MikroOrmWrapper.setupDatabase()
    repositoryManager = await MikroOrmWrapper.forkManager()

    const ruleTypeRepository = new RuleTypeRepository({
      manager: repositoryManager,
    })

    service = new RuleTypeService({
      ruleTypeRepository,
    })

    testManager = await MikroOrmWrapper.forkManager()

    await createRuleTypes(testManager)
  })

  afterEach(async () => {
    await MikroOrmWrapper.clearDatabase()
  })

  describe("list", () => {
    it("list currencies", async () => {
      const ruleTypeResult = await service.list()

      expect(ruleTypeResult).toEqual([
        expect.objectContaining({
          id: "rule-type-1",
          name: "rule 1",
        }),
        expect.objectContaining({
          id: "rule-type-2",
          name: "rule 2",
        }),
      ])
    })

    it("list currencies by id", async () => {
      const ruleTypeResult = await service.list({ id: ["rule-type-1"] })

      expect(ruleTypeResult).toEqual([
        expect.objectContaining({
          id: "rule-type-1",
          name: "rule 1",
        }),
      ])
    })
  })

  describe("listAndCount", () => {
    it("should return currencies and count", async () => {
      const [ruleTypeResult, count] = await service.listAndCount()

      expect(count).toEqual(2)
      expect(ruleTypeResult).toEqual([
        expect.objectContaining({
          id: "rule-type-1",
          name: "rule 1",
        }),
        expect.objectContaining({
          id: "rule-type-2",
          name: "rule 2",
        }),
      ])
    })

    it("should return currencies and count when filtered", async () => {
      const [ruleTypeResult, count] = await service.listAndCount({
        id: ["rule-type-1"],
      })

      expect(count).toEqual(1)
      expect(ruleTypeResult).toEqual([
        expect.objectContaining({
          id: "rule-type-1",
          name: "rule 1",
        }),
      ])
    })

    it("should return currencies and count when using skip and take", async () => {
      const [ruleTypeResult, count] = await service.listAndCount(
        {},
        { skip: 1, take: 1 }
      )

      expect(count).toEqual(2)
      expect(ruleTypeResult).toEqual([
        expect.objectContaining({
          id: "rule-type-2",
          name: "rule 2",
        }),
      ])
    })

    it("should return requested fields", async () => {
      const [ruleTypeResult, count] = await service.listAndCount(
        {},
        {
          take: 1,
          select: ["name"],
        }
      )

      const serialized = JSON.parse(JSON.stringify(ruleTypeResult))

      expect(count).toEqual(2)
      expect(serialized).toEqual([
        {
          id: "rule-type-1",
          name: "rule 1",
        },
      ])
    })
  })

  describe("retrieve", () => {

    it("should return ruleType for the given id", async () => {
      const ruleType = await service.retrieve('rule-type-1')

      expect(ruleType).toEqual(
        expect.objectContaining({
          id: "rule-type-1",
          name: "rule 1",
        })
      )
    })

    it("should throw an error when ruleType with id does not exist", async () => {
      let error

      try {
        await service.retrieve("does-not-exist")
      } catch (e) {
        error = e
      }

      expect(error.message).toEqual(
        "RuleType with id: does-not-exist was not found"
      )
    })

    it("should throw an error when an id is not provided", async () => {
      let error

      try {
        await service.retrieve(undefined as unknown as string)
      } catch (e) {
        error = e
      }

      expect(error.message).toEqual('"ruleTypeId" must be defined')
    })

    it("should return ruleType based on config select param", async () => {
      const ruleTypeResult = await service.retrieve('rule-type-1', {
        select: ["name"],
      })

      const serialized = JSON.parse(JSON.stringify(ruleTypeResult))

      expect(serialized).toEqual({
        name: 'rule 1',
        id: 'rule-type-1'
      })
    })
  })

  describe("delete", () => {
    const id = "rule-type-1"

    it("should delete the ruleTypes given an id successfully", async () => {
      await service.delete([id])

      const currencies = await service.list({
        id: [id],
      })

      expect(currencies).toHaveLength(0)
    })
  })

  describe("update", () => {
    const id = "rule-type-1"

    it("should update the name of the ruleType successfully", async () => {
      await service.update([
        {
          id,
          name: "rule 3",
        },
      ])

      const currency = await service.retrieve(id)

      expect(currency.name).toEqual("rule 3")
    })

    it("should throw an error when a id does not exist", async () => {
      let error

      try {
        await service.update([
          {
            id: "does-not-exist",
            name: "rule 3",
          },
        ])
      } catch (e) {
        error = e
      }

      expect(error.message).toEqual(
        'RuleType with id "does-not-exist" not found'
      )
    })
  })

  describe("create", () => {
    it("should create a ruleType successfully", async () => {
      await service.create([
        {
          name: "Test Rule",
          key_value: 'region_id',
        },
      ])

      const [ruleType] = await service.list({
        name: ["Test Rule"],
      })

      expect(ruleType).toEqual(
        expect.objectContaining({
          name: "Test Rule",
          key_value: 'region_id',
        })
      )
    })
  })
})
