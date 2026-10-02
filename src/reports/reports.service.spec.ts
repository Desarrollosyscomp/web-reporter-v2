// ==================== IMPORTACIONES ====================
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';

// ==================== PRUEBAS UNITARIAS ====================
describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
