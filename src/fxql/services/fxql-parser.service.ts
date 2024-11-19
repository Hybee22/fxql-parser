import { Injectable, BadRequestException } from '@nestjs/common';
import { REGEX } from '../../common/constants/regex.constants';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

@Injectable()
export class FXQLParserService {
  parse(fxqlString: string): CreateExchangeRateDto {
    try {
      const cleanedString = fxqlString.replace(/\s+/g, ' ').trim();
      const matches = REGEX.FXQL_STATEMENT.exec(cleanedString);
      
      if (!matches) {
        throw new BadRequestException('Invalid FXQL syntax');
      }

      const [_, sourceCurrency, destinationCurrency, buyRate, sellRate, cap] = matches;

      this.validateComponents(sourceCurrency, destinationCurrency, buyRate, sellRate, cap);

      return {
        sourceCurrency,
        destinationCurrency,
        buyRate: Number(buyRate),
        sellRate: Number(sellRate),
        cap: Number(cap),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private validateComponents(
    sourceCurrency: string,
    destinationCurrency: string,
    buyRate: string,
    sellRate: string,
    cap: string,
  ): void {
    if (!REGEX.CURRENCY.test(sourceCurrency) || !REGEX.CURRENCY.test(destinationCurrency)) {
      throw new BadRequestException('Invalid currency format');
    }

    if (!REGEX.NUMBER.test(buyRate) || !REGEX.NUMBER.test(sellRate)) {
      throw new BadRequestException('Invalid rate format');
    }

    if (!REGEX.WHOLE_NUMBER.test(cap)) {
      throw new BadRequestException('Invalid cap format');
    }
  }
} 