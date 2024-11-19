import { Injectable, BadRequestException } from '@nestjs/common';
import { REGEX } from '../../common/constants/regex.constants';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

@Injectable()
export class FXQLParserService {
  private readonly MAX_PAIRS = 1000;

  parseMultiple(fxqlString: string): CreateExchangeRateDto[] {
    try {
      // Normalize input
      const normalizedString = this.normalizeInput(fxqlString);

    //   // Validate statement separations
    //   this.validateStatementSeparation(normalizedString);

      // Split into individual statements
      const statements = this.splitStatements(normalizedString);

      // Check maximum pairs constraint
      if (statements.length > this.MAX_PAIRS) {
        throw new BadRequestException(
          `Exceeded maximum limit of ${this.MAX_PAIRS} currency pairs per request`,
        );
      }

      // Parse all statements and handle duplicates
      const rateMap = new Map<string, CreateExchangeRateDto>();
    
      // First, collect all unique currency pairs we need to process
      statements.forEach((statement) => {
        const parsedRate = this.parseSingle(statement);
        const pairKey = `${parsedRate.sourceCurrency}-${parsedRate.destinationCurrency}`;
        rateMap.set(pairKey, parsedRate);
      });

      // Convert map back to array and add update flag
      return Array.from(rateMap.values()).map(rate => ({
        ...rate,
        shouldUpdate: true // This flag indicates we should update if record exists
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse FXQL statements: ${error.message}`,
      );
    }
  }

  private validateStatementSeparation(input: string): void {
    // Find all closing braces followed by opening braces
    const matches = input.match(/}\s*(.*?)[A-Z]{3}-[A-Z]{3}\s*{/g);

    if (matches) {
      for (const match of matches) {
        // Count newlines between statements
        const separatorMatch = /}\s*(.*?)[A-Z]/.exec(match);
        console.log(separatorMatch);
        const separatorPart = separatorMatch[1];
        const newlineCount = (separatorPart.match(/\n/g) || []).length;

        if (newlineCount !== 1) {
          throw new BadRequestException(
            'Invalid: Multiple FXQL statements should be separated by a single newline character',
          );
        }
      }
    }
  }

  private normalizeInput(input: string): string {
    return input
      .replace(/\\n/g, '\n') // Replace escaped newlines
      .replace(/\\s/g, ' ') // Replace escaped spaces
      .replace(/\\t/g, '\t') // Replace escaped tabs
      .replace(/\r\n/g, '\n') // Normalize Windows line endings
      .trim();
  }

  private splitStatements(input: string): string[] {
    return input
      .split(/}(?=\s*[A-Z]{3}-[A-Z]{3}\s*{)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s + (s.endsWith('}') ? '' : '}'));
  }

  private parseSingle(statement: string): CreateExchangeRateDto {
    try {
      // Handle escaped newlines and normalize input
      const normalizedString = this.normalizeInput(statement);

      // Validate empty or undefined input
      if (!normalizedString?.trim()) {
        throw new BadRequestException('Empty FXQL statement');
      }

      // Remove comments and normalize whitespace
      const cleanedString = this.cleanStatement(normalizedString);

      // Validate multiple statements
      if (this.containsMultipleStatements(cleanedString)) {
        throw new BadRequestException(
          'Multiple FXQL statements are not allowed in a single input',
        );
      }

      const matches = REGEX.FXQL_STATEMENT.exec(cleanedString);

      if (!matches) {
        // Try to provide more specific error messages
        this.diagnoseStatementError(cleanedString);
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
    if (curr1 !== curr1.toUpperCase()) {
      throw new BadRequestException(
        `Invalid: '${curr1}' should be '${curr1.toUpperCase()}'`,
      );
    }
    if (curr2 !== curr2.toUpperCase()) {
      throw new BadRequestException(
        `Invalid: '${curr2}' should be '${curr2.toUpperCase()}'`,
      );
    }

    // Check for missing space after currency pair
    if (/[A-Z]{3}-[A-Z]{3}{/.exec(statement)) {
      throw new BadRequestException('Missing single space after currency pair');
    }

    // Check for invalid numeric values
    const buyMatch = /BUY\s+([^\s]+)/.exec(statement);
    const sellMatch = /SELL\s+([^\s]+)/.exec(statement);
    const capMatch = /CAP\s+([^\s]+)/.exec(statement);

    if (buyMatch && !REGEX.NUMBER.test(buyMatch[1])) {
      throw new BadRequestException(
        `Invalid: '${buyMatch[1]}' is not a valid numeric amount`,
      );
    }

    if (sellMatch && !REGEX.NUMBER.test(sellMatch[1])) {
      throw new BadRequestException(
        `Invalid: '${sellMatch[1]}' is not a valid numeric amount`,
      );
    }

    if (capMatch) {
      const capValue = Number(capMatch[1]);
      if (!REGEX.WHOLE_NUMBER.test(capMatch[1])) {
        throw new BadRequestException('Invalid: CAP must be a whole number');
      }
      if (capValue < 0) {
        throw new BadRequestException(
          'Invalid: CAP cannot be a negative number',
        );
      }
    }

    // Check for empty statement
    if (/{\s*}/.exec(statement)) {
      throw new BadRequestException('Invalid: Empty FXQL statement');
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
