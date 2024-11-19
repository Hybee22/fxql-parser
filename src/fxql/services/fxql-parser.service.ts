import { Injectable, BadRequestException } from '@nestjs/common';
import { REGEX } from '../../common/constants/regex.constants';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

@Injectable()
export class FXQLParserService {
  parse(fxqlString: string): CreateExchangeRateDto {
    try {
      // Validate empty or undefined input
      if (!fxqlString?.trim()) {
        throw new BadRequestException('Empty FXQL statement');
      }

      // Remove comments and normalize whitespace
      const cleanedString = this.cleanStatement(fxqlString);

      // Validate multiple statements
      if (this.containsMultipleStatements(cleanedString)) {
        throw new BadRequestException(
          'Multiple FXQL statements are not allowed in a single input',
        );
      }

      const matches = REGEX.FXQL_STATEMENT.exec(cleanedString);

      if (!matches) {
        // Try to provide more specific error messages
        this.diagnoseStatementError(fxqlString);
        throw new BadRequestException('Invalid FXQL syntax');
      }

      const [_, sourceCurrency, destinationCurrency, buyRate, sellRate, cap] =
        matches;

      this.validateComponents(
        sourceCurrency,
        destinationCurrency,
        buyRate,
        sellRate,
        cap,
      );

      return {
        sourceCurrency,
        destinationCurrency,
        buyRate: Number(buyRate),
        sellRate: Number(sellRate),
        cap: Number(cap),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse FXQL statement: ${error.message}`,
      );
    }
  }

  private cleanStatement(statement: string): string {
    return (
      statement
        // Remove comments
        .replace(/#.*$/gm, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  private containsMultipleStatements(statement: string): boolean {
    const statementCount = (statement.match(/}\s*{/g) || []).length;
    return statementCount > 0;
  }

  private diagnoseStatementError(statement: string): void {
    // Check currency pair format
    const currencyPairMatch = /^([A-Za-z]{3})-([A-Za-z]{3})/.exec(statement);
    if (!currencyPairMatch) {
      throw new BadRequestException('Invalid currency pair format');
    }

    const [_, curr1, curr2] = currencyPairMatch;
    if (curr1 !== curr1.toUpperCase() || curr2 !== curr2.toUpperCase()) {
      throw new BadRequestException('Currencies must be in uppercase');
    }

    // Check for missing space after currency pair
    if (/[A-Z]{3}-[A-Z]{3}{/.exec(statement)) {
      throw new BadRequestException('Missing space after currency pair');
    }

    // Check for invalid numeric values
    const buyMatch = /BUY\s+([^\s]+)/.exec(statement);
    const sellMatch = /SELL\s+([^\s]+)/.exec(statement);
    const capMatch = /CAP\s+([^\s]+)/.exec(statement);

    if (buyMatch && !REGEX.NUMBER.test(buyMatch[1])) {
      throw new BadRequestException('Invalid BUY rate format');
    }

    if (sellMatch && !REGEX.NUMBER.test(sellMatch[1])) {
      throw new BadRequestException('Invalid SELL rate format');
    }

    if (capMatch) {
      const capValue = Number(capMatch[1]);
      if (!REGEX.WHOLE_NUMBER.test(capMatch[1])) {
        throw new BadRequestException('CAP must be a whole number');
      }
      if (capValue < 0) {
        throw new BadRequestException('CAP cannot be negative');
      }
    }

    // Check for empty statement
    if (/{\s*}/.exec(statement)) {
      throw new BadRequestException('Empty FXQL statement');
    }
  }

  private validateComponents(
    sourceCurrency: string,
    destinationCurrency: string,
    buyRate: string,
    sellRate: string,
    cap: string,
  ): void {
    // Currency validation
    if (!REGEX.CURRENCY.test(sourceCurrency)) {
      throw new BadRequestException(
        `Invalid source currency: ${sourceCurrency}`,
      );
    }

    if (!REGEX.CURRENCY.test(destinationCurrency)) {
      throw new BadRequestException(
        `Invalid destination currency: ${destinationCurrency}`,
      );
    }

    // Rate validation
    if (!REGEX.NUMBER.test(buyRate)) {
      throw new BadRequestException('Invalid BUY rate format');
    }

    if (!REGEX.NUMBER.test(sellRate)) {
      throw new BadRequestException('Invalid SELL rate format');
    }

    // Cap validation
    if (!REGEX.WHOLE_NUMBER.test(cap)) {
      throw new BadRequestException('CAP must be a whole number');
    }

    const capValue = Number(cap);
    if (capValue < 0) {
      throw new BadRequestException('CAP cannot be negative');
    }

    // Additional business logic validation
    const buyRateValue = Number(buyRate);
    const sellRateValue = Number(sellRate);

    if (buyRateValue <= 0 || sellRateValue <= 0) {
      throw new BadRequestException('Rates must be greater than zero');
    }

    if (buyRateValue >= sellRateValue) {
      throw new BadRequestException('SELL rate must be greater than BUY rate');
    }
  }
}
