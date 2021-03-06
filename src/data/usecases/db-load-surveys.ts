import { SurveyModel } from '@/domain/models'
import { LoadSurveys } from '@/domain/usecases'
import { LoadSurveysRepository } from '../protocols'

export class DbLoadSurveys implements LoadSurveys {
  constructor (private readonly loadSurveysRepository: LoadSurveysRepository) {}
  async load (accountId: string): Promise<SurveyModel[] | null> {
    const surveys = await this.loadSurveysRepository.loadAll(accountId)
    return surveys
  }
}
