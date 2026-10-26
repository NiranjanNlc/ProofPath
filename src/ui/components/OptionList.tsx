import type { ChallengeOption } from '../../domain/types';
import './OptionList.css';

export const optionLetter = (index: number) => String.fromCharCode(65 + index);

interface Props {
  options: ChallengeOption[];
  selectedId: string | null;
  triedWrongIds: string[];
  disabled: boolean;
  correctId?: string;
  onSelect: (id: string) => void;
}

export function OptionList({
  options,
  selectedId,
  triedWrongIds,
  disabled,
  correctId,
  onSelect,
}: Props) {
  return (
    <div className="options" role="radiogroup" aria-label="Answer options">
      {options.map((option, index) => {
        const tried = triedWrongIds.includes(option.id);
        const isCorrect = disabled && option.id === correctId;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selectedId === option.id}
            disabled={disabled}
            className="option"
            data-selected={selectedId === option.id}
            data-tried={tried}
            data-correct={isCorrect}
            onClick={() => onSelect(option.id)}
          >
            <span className="option__letter">{optionLetter(index)}</span>
            <span className="option__text">{option.text}</span>
            {tried && <span className="label option__note">tried</span>}
            {isCorrect && <span className="label option__note">answer</span>}
          </button>
        );
      })}
    </div>
  );
}
