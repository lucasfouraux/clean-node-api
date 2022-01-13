
import { SurveyResultMongoRepository } from './survey-result-mongo-repository'
import { MongoHelper } from '../helpers/mongo-helper'
import { Collection, ObjectId } from 'mongodb'
import { SurveyModel } from '@/domain/models/survey'
import { SurveyMongoRepository } from '../survey/survey-mongo-repository'
import { AccountModel } from '@/domain/models/account'
import { AccountMongoRepository } from '../account/account-mongo-repository'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const makeSut = (): SurveyResultMongoRepository => {
  return new SurveyResultMongoRepository()
}

const makeSurvey = async (): Promise<SurveyModel | null> => {
  const res = await surveyCollection.insertOne({
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }, {
      image: 'other_image',
      answer: 'other_answer'
    }],
    date: new Date()
  })

  const surveyMongoRepository = new SurveyMongoRepository()
  const teste = res.insertedId.toHexString()
  console.log('*** ***: ' + teste)
  const survey = await surveyMongoRepository.loadById(teste)
  return survey
}

const makeAccount = async (): Promise<AccountModel | null> => {
  await accountCollection.insertOne({
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  })

  const accountMongoRepository = new AccountMongoRepository()
  const account = await accountMongoRepository.loadByEmail('any_email@mail.com')
  return account
}

describe('Survey Mongo Repository', () => {
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

  describe('save()', () => {
    it('should add a survey result if its new', async () => {
      const survey = await makeSurvey()
      const account = await makeAccount()
      const sut = makeSut()
      const surveyResult = await sut.save({
        surveyId: survey?.id as string,
        accountId: account?.id as string,
        answer: survey?.answers[0].answer as string,
        date: new Date()
      })
      expect(surveyResult).toBeTruthy()
      console.log('1')
      console.log(surveyResult?.surveyId)
      console.log('2')
      console.log(survey?.id)
      expect(surveyResult?.surveyId.toString()).toBe(survey?.id)
      expect(surveyResult?.answers[0].answer).toBe(survey?.answers[0].answer)
      expect(surveyResult?.answers[0].count).toBe(1)
      expect(surveyResult?.answers[0].percent).toBe(100)
    })

    it('should update survey result if its not new', async () => {
      const survey = await makeSurvey()
      const account = await makeAccount()
      await surveyResultCollection.insertOne({
        surveyId: new ObjectId(survey?.id as string),
        accountId: new ObjectId(account?.id as string),
        answer: survey?.answers[0].answer as string,
        date: new Date()
      })
      const sut = makeSut()
      const surveyResult = await sut.save({
        surveyId: survey?.id as string,
        accountId: account?.id as string,
        answer: survey?.answers[1].answer as string,
        date: new Date()
      })
      expect(surveyResult).toBeTruthy()
      console.log('1')
      console.log(surveyResult?.surveyId)
      console.log('2')
      console.log(survey?.id)
      expect(surveyResult?.surveyId.toString()).toBe(survey?.id)
      expect(surveyResult?.answers[0].answer).toBe(survey?.answers[1].answer)
      expect(surveyResult?.answers[0].count).toBe(1)
      expect(surveyResult?.answers[0].percent).toBe(100)
    })
  })
})
