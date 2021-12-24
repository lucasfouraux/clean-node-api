import request from 'supertest'
import app from '@/main/config/app'

describe('Survey Routes', () => {
  describe('PUT /surveys/:surveyId/results', () => {
    it('should return 403 on save survey without accessToken', async () => {
      await request(app)
        .put('/api/surveys/any_id/results')
        .send({
          answer: 'any_answer'
        })
        .expect(403)
    })
  })
})
