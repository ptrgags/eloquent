export interface Idea {
    id: number,
    name: string,
    elo: number,
    comparisons: number
    cost?: number
}

let next_id: number = 0;
export function create_idea(name: string, cost?: number): Idea {
    const id = next_id;
    next_id++;
    return {
        id,
        name,
        elo: 1000,
        comparisons: 0,
        cost
    }
}

// When prompted to choose between two items, do I prefer the first, the
// second, or no preference
export enum Preference {
    First,
    Second,
    NoPreference
}

function swap_sides(preference: Preference): number {
    switch (preference) {
        case Preference.First:
            return Preference.Second;
        case Preference.Second:
            return Preference.First;
        default:
            return preference;
    }
}

function win_score(preference: Preference): number {
    switch(preference) {
        case Preference.First:
            return 1.0;
        case Preference.Second:
            return 0.0;
        case Preference.NoPreference:
            return 0.5;
    }
}

function expectation(idea: Idea, other: Idea): number {
    const elo_diff: number = other.elo - idea.elo;
    return 1.0 / (1.0 + Math.pow(10.0, elo_diff / 400));
}

const K_FACTOR = 32;

export function update_ratings(first: Idea, second: Idea, preference: Preference) {
    // Compute these up-front because they use the elo values which will 
    // be updated below.
    const expectation_first = expectation(first, second);
    const expectation_second = expectation(second, first);

    // From each idea's perspective, did we win the preference contest?
    const score_first = win_score(preference);
    const score_second = win_score(swap_sides(preference));

    // Update the ELO values
    first.elo += K_FACTOR * (score_first - expectation_first);
    second.elo += K_FACTOR * (score_second - expectation_second);

    // Also update the comparison count
    first.comparisons++;
    second.comparisons++;
} 