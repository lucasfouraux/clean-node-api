
import { SurveyMongoRepository } from '@/infra/db/mongodb/survey-mongo-repository'
import { MongoHelper } from '@/infra/db/mongodb/mongo-helper'
import { Collection } from 'mongodb'
import { mockAddAccountParams, mockAddSurveyParams } from '@/../tests/domain/mocks'
import FakeObjectId from 'bson-objectid'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const mockAccountId = async (): Promise<string | null> => {
  const accounData = mockAddAccountParams()
  const res = await accountCollection.insertOne(accounData)
  return res.insertedId.toHexString()
}

const makeSut = (): SurveyMongoRepository => {
  return new SurveyMongoRepository()
}

describe('SurveyMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
    surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('add()', () => {
    it('should add a survey on success', async () => {
      const sut = makeSut()
      await sut.add(mockAddSurveyParams())
      const count = await surveyCollection.countDocuments()
      expect(count).toBe(1)
    })
  })

  describe('loadAll()', () => {
    // it('should load all surveys on success', async () => {
    //   const account = await mockAccount()
    //   const addSurveyModels = [mockAddSurveyParams(), mockAddSurveyParams()]
    //   const survey = await surveyCollection.insertMany(addSurveyModels)
    //   const sut = makeSut()
    //   await surveyResultCollection.insertOne({
    //     surveyId: survey.insertedIds[0].toHexString(),
    //     accountId: account?.id,
    //     answer: addSurveyModels[0].answers[0].answer,
    //     date: new Date()
    //   })
    //   console.log(account?.id)
    //   const surveys = await sut.loadAll(account?.id as string)
    //   console.log(surveys)
    //   expect(surveys.length).toBe(2)
    //   expect(surveys[0].id).toBeTruthy()
    //   expect(surveys[1].id).toBeTruthy()
    //   expect(surveys[0].question).toBe(addSurveyModels[0].question)
    //   expect(surveys[0].didAnswer).toBe(true)
    //   expect(surveys[1].question).toBe(addSurveyModels[1].question)
    //   expect(surveys[1].didAnswer).toBe(false)
    // })

    it('should load empty list', async () => {
      const accountId = await mockAccountId()
      const sut = makeSut()
      const surveys = await sut.loadAll(accountId as string)
      expect(surveys.length).toBe(0)
    })
  })

  describe('loadById()', () => {
    it('should load survey by id on success', async () => {
      const res = await surveyCollection.insertOne(mockAddSurveyParams())
      const sut = makeSut()
      const survey = await sut.loadById(res.insertedId.toHexString())
      expect(survey).toBeTruthy()
    })
  })

  describe('checkById()', () => {
    it('should return true if survey exists', async () => {
      const res = await surveyCollection.insertOne(mockAddSurveyParams())
      const sut = makeSut()
      const exists = await sut.checkById(res.insertedId.toHexString())
      expect(exists).toBe(true)
    })

    it('should return true if survey exists', async () => {
      const sut = makeSut()
      const exists = await sut.checkById(FakeObjectId.createFromTime(Date.now()).toHexString())
      expect(exists).toBe(false)
    })
  })
})
