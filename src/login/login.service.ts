import { TServiceResponse } from '../local-responses/response-types/service-response.type';
import { ConxposUtilityAuth } from '../postgres-entities/conxpos-utility-auth.entity';
import postgresDatasource from '../database/postgres/postgres.connection';
export class LoginService {

  public async login(username: string, password: string): Promise<TServiceResponse> {
    const dataSource = await postgresDatasource();
    try {
      const conxposUtilityAuthRepository = dataSource.getRepository(ConxposUtilityAuth);
      const user = await conxposUtilityAuthRepository.findOne({ where: { username } });
      return {
        data: {
          user: user,
        },
        error: false
      }
    } catch (error: any) {
      return { error: true, data: { error: error.message } };
    } finally {
      await dataSource.destroy();
    }
  }
}
